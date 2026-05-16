from django.db.models import Count, F, Sum
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Batch, Category, ConsumptionLog, ProductTemplate
from .serializers import (
    BatchSerializer,
    CategorySerializer,
    ConsumeSerializer,
    ProductTemplateSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductTemplate.objects.all()
    serializer_class = ProductTemplateSerializer
    search_fields = ["name"]
    filterset_fields = ["category"]


class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    filterset_fields = ["restaurant", "storage", "status", "product_template"]
    ordering_fields = ["received_at", "Q_current", "quantity_current"]
    search_fields = ["product_template__name"]

    def get_queryset(self):
        return Batch.objects.filter(
            restaurant__owner=self.request.user
        ).select_related("product_template", "storage")

    @action(detail=True, methods=["post"])
    def consume(self, request, pk=None):
        batch = self.get_object()
        serializer = ConsumeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qty = serializer.validated_data["quantity"]
        if qty > batch.quantity_current:
            return Response({"detail": "Not enough quantity."}, status=400)
        batch.quantity_current -= qty
        if batch.quantity_current <= 0:
            batch.status = Batch.Status.CONSUMED
        batch.save(update_fields=["quantity_current", "status"])
        ConsumptionLog.objects.create(
            batch=batch,
            quantity=qty,
            used_by=request.user,
            purpose=serializer.validated_data.get("purpose", "cooking"),
            note=serializer.validated_data.get("note", ""),
        )
        return Response(BatchSerializer(batch).data)

    @action(detail=True, methods=["post"])
    def waste(self, request, pk=None):
        batch = self.get_object()
        qty = float(request.data.get("quantity", batch.quantity_current))
        note = request.data.get("note", "")
        qty = min(qty, batch.quantity_current)
        batch.quantity_current -= qty
        if batch.quantity_current <= 0:
            batch.status = Batch.Status.WASTED
        batch.save(update_fields=["quantity_current", "status"])
        ConsumptionLog.objects.create(
            batch=batch,
            quantity=qty,
            used_by=request.user,
            purpose=ConsumptionLog.Purpose.WASTE,
            note=note,
        )
        return Response(BatchSerializer(batch).data)

    @action(detail=True, methods=["get"], url_path="quality-history")
    def quality_history(self, request, pk=None):
        batch = self.get_object()
        from apps.math_engine.freshness import quality_history

        return Response(quality_history(batch))


class DashboardSummaryView(APIView):
    def get(self, request):
        qs = Batch.objects.filter(
            restaurant__owner=request.user, status=Batch.Status.ACTIVE
        ).select_related("product_template")
        critical = qs.filter(Q_current__lte=F("product_template__Q_critical")).count()
        total_value = qs.aggregate(
            v=Sum(F("quantity_current") * F("unit_price"))
        )["v"] or 0

        buckets = {"excellent": 0, "good": 0, "warning": 0, "critical": 0}
        for b in qs:
            q = b.Q_current
            if q >= 0.85:
                buckets["excellent"] += 1
            elif q >= 0.70:
                buckets["good"] += 1
            elif q >= b.product_template.Q_critical:
                buckets["warning"] += 1
            else:
                buckets["critical"] += 1

        from apps.alerts.models import Alert
        recent_alerts = Alert.objects.filter(
            restaurant__owner=request.user
        ).order_by("-created_at")[:5].values(
            "id", "type", "severity", "message", "created_at", "read_at"
        )

        return Response({
            "active_batches": qs.count(),
            "critical_batches": critical,
            "total_inventory_value": float(total_value),
            "quality_distribution": buckets,
            "recent_alerts": list(recent_alerts),
            "generated_at": timezone.now(),
        })
