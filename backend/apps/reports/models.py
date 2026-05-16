from django.db import models

from apps.restaurants.models import Restaurant


class MonthlyReport(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="monthly_reports"
    )
    period_start = models.DateField()
    period_end = models.DateField()
    total_received_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_consumed_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_wasted_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    waste_percentage = models.FloatField(default=0)
    money_saved = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True)

    class Meta:
        ordering = ["-period_start"]
        unique_together = ("restaurant", "period_start")
