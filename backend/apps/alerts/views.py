from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Alert
from .serializers import AlertSerializer


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AlertSerializer
    filterset_fields = ["restaurant", "severity", "type"]

    def get_queryset(self):
        qs = Alert.objects.filter(restaurant__owner=self.request.user)
        unread = self.request.query_params.get("unread")
        if unread in ("1", "true"):
            qs = qs.filter(read_at__isnull=True)
        return qs

    @action(detail=True, methods=["patch"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        alert = self.get_object()
        alert.read_at = timezone.now()
        alert.save(update_fields=["read_at"])
        return Response(AlertSerializer(alert).data)
