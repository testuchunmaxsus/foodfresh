from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import SensorIngestView, TemperatureReadingViewSet

router = DefaultRouter()
router.register("temperature-readings", TemperatureReadingViewSet, basename="temperature")

urlpatterns = router.urls + [
    path("sensors/ingest/", SensorIngestView.as_view(), name="sensor-ingest"),
]
