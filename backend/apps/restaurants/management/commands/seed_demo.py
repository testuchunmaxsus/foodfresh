import os
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.alerts.models import Alert
from apps.inventory.models import Batch, ProductTemplate
from apps.math_engine.freshness import calculate_quality
from apps.restaurants.models import Restaurant, Storage
from apps.sensors.models import TemperatureReading
from apps.users.models import User


STORAGES = [
    ("Sovutgich-1 (go'sht)", "fridge",   0,   4,  2.5),
    ("Sovutgich-2 (sabzavot)", "fridge", 4,   10, 7.0),
    ("Muzlatgich",            "freezer", -22, -16, -18.0),
]

# (product_name, storage_index, qty, age_days, unit_price_uzs)
BATCHES = [
    ("Mol go'shti (xom)",  0, 12.0, 1, 95000),
    ("Mol go'shti (xom)",  0,  8.0, 4, 95000),
    ("Tovuq (xom)",        0, 15.0, 2, 42000),
    ("Tovuq (xom)",        0,  6.0, 4, 42000),
    ("Baliq",              0,  5.0, 1, 78000),
    ("Baliq",              0,  3.0, 2, 78000),
    ("Sut",                0, 20.0, 3, 14000),
    ("Yashil sabzavotlar", 1,  9.0, 0, 22000),
    ("Olma",               1, 18.0, 0, 18000),
]


class Command(BaseCommand):
    help = "Seed a demo owner + restaurant + storages + batches + readings (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing demo data first.")

    def handle(self, *args, **options):
        email = os.environ.get("DEMO_USER_EMAIL", "demo@freshfood.uz")
        password = os.environ.get("DEMO_USER_PASSWORD", "demo12345")

        owner, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": "Demo",
                "last_name": "Owner",
                "role": User.Role.OWNER,
            },
        )
        if created:
            owner.set_password(password)
            owner.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo owner: {email} / {password}"))
        else:
            self.stdout.write(f"Demo owner exists: {email}")

        if options["reset"]:
            Restaurant.objects.filter(owner=owner, name="Demo Restoran").delete()
            self.stdout.write(self.style.WARNING("Reset: existing demo restaurant deleted."))

        restaurant, r_created = Restaurant.objects.get_or_create(
            owner=owner,
            name="Demo Restoran",
            defaults={
                "address": "Toshkent, Chilonzor",
                "phone": "+998 71 200 00 00",
                "subscription_plan": Restaurant.Plan.PREMIUM,
            },
        )
        if not r_created:
            self.stdout.write("Demo restaurant exists — skipping storages/batches seeding.")
            return

        storage_objs = []
        for name, kind, t_min, t_max, current in STORAGES:
            s = Storage.objects.create(
                restaurant=restaurant, name=name, type=kind,
                target_temp_min=t_min, target_temp_max=t_max, current_temp=current,
            )
            storage_objs.append(s)

        templates = {p.name: p for p in ProductTemplate.objects.all()}
        if not templates:
            self.stdout.write(self.style.ERROR(
                "No product templates found. Run `seed_products` first."
            ))
            return

        now = timezone.now()
        created_batches = 0
        for product_name, storage_idx, qty, age_days, price in BATCHES:
            tpl = templates.get(product_name)
            if not tpl:
                continue
            storage = storage_objs[storage_idx]
            received = now - timedelta(days=age_days)
            batch = Batch.objects.create(
                restaurant=restaurant,
                product_template=tpl,
                storage=storage,
                quantity_initial=qty,
                quantity_current=qty,
                unit_price=Decimal(str(price)),
                received_at=received,
            )
            self._seed_readings(storage, since=received, now=now)
            batch.Q_current = calculate_quality(batch, now=now)
            batch.last_calculated_at = now
            batch.save(update_fields=["Q_current", "last_calculated_at"])
            created_batches += 1
            if batch.Q_current <= tpl.Q_critical:
                Alert.objects.create(
                    restaurant=restaurant,
                    batch=batch,
                    type=Alert.Type.EXPIRY_WARNING,
                    severity=Alert.Severity.CRITICAL,
                    message=f"{tpl.name}: Q={batch.Q_current:.2f}, kritik chegaraga yetdi.",
                )

        self.stdout.write(self.style.SUCCESS(
            f"Demo ready: {created_batches} batches, {len(storage_objs)} storages."
        ))

    def _seed_readings(self, storage, since, now):
        if TemperatureReading.objects.filter(storage=storage).exists():
            return
        cursor = since
        target_mid = (storage.target_temp_min + storage.target_temp_max) / 2
        rng = random.Random(storage.id)
        while cursor < now:
            jitter = rng.uniform(-0.6, 0.6)
            TemperatureReading.objects.create(
                storage=storage,
                temperature=round(target_mid + jitter, 2),
                recorded_at=cursor,
                source=TemperatureReading.Source.SENSOR,
            )
            cursor += timedelta(hours=6)
