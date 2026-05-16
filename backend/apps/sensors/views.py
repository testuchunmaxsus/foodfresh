from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.restaurants.models import Storage

from .models import TemperatureReading
from .serializers import IngestSerializer, TemperatureReadingSerializer


class TemperatureReadingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TemperatureReadingSerializer
    filterset_fields = ["storage"]
    ordering_fields = ["recorded_at", "temperature"]
    pagination_class = None

    def get_queryset(self):
        return TemperatureReading.objects.filter(
            storage__restaurant__owner=self.request.user
        )

    def filter_queryset(self, queryset):
        return super().filter_queryset(queryset)[:500]


class SensorIngestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = IngestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sensor_id = serializer.validated_data["sensor_id"]
        try:
            storage = Storage.objects.get(sensor_id=sensor_id)
        except Storage.DoesNotExist:
            return Response({"detail": "Unknown sensor."}, status=404)
        reading = TemperatureReading.objects.create(
            storage=storage,
            temperature=serializer.validated_data["temperature"],
            source=TemperatureReading.Source.SENSOR,
        )
        storage.current_temp = reading.temperature
        storage.save(update_fields=["current_temp"])
        return Response(TemperatureReadingSerializer(reading).data, status=201)
