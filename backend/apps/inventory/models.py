from django.conf import settings
from django.db import models

from apps.restaurants.models import Restaurant, Storage


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    icon = models.CharField(max_length=64, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class ProductTemplate(models.Model):
    class Unit(models.TextChoices):
        KG = "kg", "Kilogram"
        L = "l", "Liter"
        PIECE = "piece", "Piece"

    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="products"
    )
    unit = models.CharField(max_length=8, choices=Unit.choices, default=Unit.KG)
    E_a = models.FloatField(help_text="Activation energy, kJ/mol")
    A_coefficient = models.FloatField(help_text="Pre-exponential factor (1/hour)")
    T_optimal_min = models.FloatField(help_text="Optimal storage temperature min, °C")
    T_optimal_max = models.FloatField(help_text="Optimal storage temperature max, °C")
    Q_critical = models.FloatField(default=0.6, help_text="Critical quality threshold")
    shelf_life_days_at_4C = models.PositiveIntegerField(default=7)
    image = models.ImageField(upload_to="product_templates/", null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Batch(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        CONSUMED = "consumed", "Consumed"
        WASTED = "wasted", "Wasted"

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="batches")
    product_template = models.ForeignKey(
        ProductTemplate, on_delete=models.PROTECT, related_name="batches"
    )
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT, related_name="batches")
    quantity_initial = models.FloatField()
    quantity_current = models.FloatField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    received_at = models.DateTimeField()
    expiry_date_manual = models.DateField(null=True, blank=True)
    Q_current = models.FloatField(default=1.0)
    last_calculated_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        indexes = [
            models.Index(fields=["restaurant", "status", "Q_current"]),
        ]
        ordering = ["-received_at"]

    def __str__(self) -> str:
        return f"{self.product_template.name} x{self.quantity_current}"


class ConsumptionLog(models.Model):
    class Purpose(models.TextChoices):
        COOKING = "cooking", "Cooking"
        WASTE = "waste", "Waste"
        RETURN = "return", "Return"

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="consumptions")
    quantity = models.FloatField()
    used_at = models.DateTimeField(auto_now_add=True)
    used_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    purpose = models.CharField(max_length=16, choices=Purpose.choices, default=Purpose.COOKING)
    note = models.CharField(max_length=500, blank=True)
