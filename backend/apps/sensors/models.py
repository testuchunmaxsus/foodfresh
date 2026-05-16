from django.db import models

from apps.restaurants.models import Storage


class TemperatureReading(models.Model):
    class Source(models.TextChoices):
        SENSOR = "sensor", "Sensor"
        MANUAL = "manual", "Manual"

    storage = models.ForeignKey(Storage, on_delete=models.CASCADE, related_name="readings")
    temperature = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=16, choices=Source.choices, default=Source.SENSOR)

    class Meta:
        indexes = [models.Index(fields=["storage", "-recorded_at"])]
        ordering = ["-recorded_at"]
