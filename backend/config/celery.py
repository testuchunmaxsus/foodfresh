import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("freshfood")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "recalculate-qualities-every-30min": {
        "task": "apps.math_engine.tasks.recalculate_all_qualities",
        "schedule": crontab(minute="*/30"),
    },
    "check-critical-batches-hourly": {
        "task": "apps.math_engine.tasks.check_critical_batches",
        "schedule": crontab(minute=0),
    },
    "daily-fifo-recommendation": {
        "task": "apps.math_engine.tasks.daily_fifo_recommendation",
        "schedule": crontab(hour=6, minute=0),
    },
    "simulate-sensors-30s": {
        "task": "apps.sensors.tasks.simulate_sensors",
        "schedule": 30.0,
    },
}
