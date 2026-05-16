from django.db import models

from apps.inventory.models import Batch
from apps.restaurants.models import Restaurant


class Alert(models.Model):
    class Type(models.TextChoices):
        EXPIRY_WARNING = "expiry_warning", "Expiry warning"
        TEMP_ANOMALY = "temp_anomaly", "Temperature anomaly"
        LOW_STOCK = "low_stock", "Low stock"

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        CRITICAL = "critical", "Critical"

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="alerts")
    batch = models.ForeignKey(
        Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name="alerts"
    )
    type = models.CharField(max_length=32, choices=Type.choices)
    severity = models.CharField(max_length=16, choices=Severity.choices, default=Severity.WARNING)
    message = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    action_taken = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["restaurant", "read_at"])]
