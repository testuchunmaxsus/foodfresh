from celery import shared_task
from django.db.models import F
from django.utils import timezone

from apps.alerts.models import Alert
from apps.inventory.models import Batch

from .freshness import calculate_quality


@shared_task
def recalculate_all_qualities() -> int:
    updated = 0
    for batch in Batch.objects.filter(status=Batch.Status.ACTIVE).select_related(
        "product_template", "storage"
    ):
        q = calculate_quality(batch)
        batch.Q_current = q
        batch.last_calculated_at = timezone.now()
        batch.save(update_fields=["Q_current", "last_calculated_at"])
        updated += 1
    return updated


@shared_task
def check_critical_batches() -> int:
    qs = Batch.objects.filter(
        status=Batch.Status.ACTIVE,
        Q_current__lte=F("product_template__Q_critical"),
    ).select_related("product_template", "restaurant")
    created = 0
    for batch in qs:
        already = Alert.objects.filter(
            batch=batch,
            type=Alert.Type.EXPIRY_WARNING,
            read_at__isnull=True,
        ).exists()
        if already:
            continue
        Alert.objects.create(
            restaurant=batch.restaurant,
            batch=batch,
            type=Alert.Type.EXPIRY_WARNING,
            severity=Alert.Severity.CRITICAL,
            message=f"{batch.product_template.name}: Q={batch.Q_current:.2f}, kritik chegaraga yetdi.",
        )
        created += 1
    return created


@shared_task
def daily_fifo_recommendation() -> None:
    return None
