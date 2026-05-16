from django.conf import settings
from django.db import models


class Restaurant(models.Model):
    class Plan(models.TextChoices):
        FREE = "free", "Free"
        BASIC = "basic", "Basic"
        PREMIUM = "premium", "Premium"

    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="restaurants"
    )
    address = models.CharField(max_length=500, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    tax_id = models.CharField(max_length=32, blank=True)
    subscription_plan = models.CharField(max_length=16, choices=Plan.choices, default=Plan.FREE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Storage(models.Model):
    class Type(models.TextChoices):
        FRIDGE = "fridge", "Fridge"
        FREEZER = "freezer", "Freezer"
        DRY = "dry", "Dry storage"

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="storages")
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.FRIDGE)
    target_temp_min = models.FloatField(default=0)
    target_temp_max = models.FloatField(default=4)
    current_temp = models.FloatField(null=True, blank=True)
    sensor_id = models.CharField(max_length=64, blank=True)
    simulate_sensor = models.BooleanField(
        default=False,
        help_text="Generate synthetic sensor readings every 30s.",
    )

    class Meta:
        ordering = ["restaurant_id", "name"]

    def __str__(self) -> str:
        return f"{self.restaurant.name} / {self.name}"
