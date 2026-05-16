import random

from celery import shared_task
from django.utils import timezone

from apps.restaurants.models import Storage

from .models import TemperatureReading


@shared_task
def simulate_sensors() -> int:
    """Emit one synthetic reading per storage with simulate_sensor=True.

    Temperature is sampled from a normal distribution around the midpoint of
    the storage's target range, with occasional anomalies (5% chance of a
    +2.5°C spike) so the alert pipeline has something to react to.
    """
    storages = Storage.objects.filter(simulate_sensor=True)
    count = 0
    for storage in storages:
        mid = (storage.target_temp_min + storage.target_temp_max) / 2.0
        spread = max(0.4, (storage.target_temp_max - storage.target_temp_min) / 4.0)
        temp = random.gauss(mid, spread)
        if random.random() < 0.05:
            temp += random.uniform(2.0, 4.0)
        temp = round(temp, 2)
        TemperatureReading.objects.create(
            storage=storage,
            temperature=temp,
            recorded_at=timezone.now(),
            source=TemperatureReading.Source.SENSOR,
        )
        storage.current_temp = temp
        storage.save(update_fields=["current_temp"])
        count += 1
    return count
