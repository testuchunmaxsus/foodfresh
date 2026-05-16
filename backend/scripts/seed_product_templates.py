"""Seed initial categories and product templates from the ТЗ table.

Run: python manage.py shell < scripts/seed_product_templates.py
or:  docker compose exec backend python scripts/seed_product_templates.py
"""
import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.inventory.models import Category, ProductTemplate  # noqa: E402

CATEGORIES = ["Go'sht", "Sut mahsulotlari", "Baliq", "Sabzavotlar", "Mevalar"]

TEMPLATES = [
    ("Mol go'shti (xom)",     "Go'sht",            "kg", 75, 1.2e11, 0, 4, 0.60, 5),
    ("Tovuq (xom)",            "Go'sht",            "kg", 70, 9.5e10, 0, 4, 0.65, 4),
    ("Baliq",                  "Baliq",             "kg", 65, 8.0e10, -1, 2, 0.70, 3),
    ("Sut",                    "Sut mahsulotlari",  "l",  80, 1.5e11, 2, 6, 0.55, 7),
    ("Yashil sabzavotlar",     "Sabzavotlar",       "kg", 60, 5.0e10, 4, 10, 0.50, 7),
    ("Olma",                   "Mevalar",           "kg", 55, 3.5e10, 6, 12, 0.45, 14),
]


def run() -> None:
    cats = {}
    for name in CATEGORIES:
        cat, _ = Category.objects.get_or_create(name=name)
        cats[name] = cat

    for name, cat_name, unit, ea, a, t_min, t_max, q_c, shelf in TEMPLATES:
        ProductTemplate.objects.update_or_create(
            name=name,
            defaults={
                "category": cats[cat_name],
                "unit": unit,
                "E_a": ea,
                "A_coefficient": a,
                "T_optimal_min": t_min,
                "T_optimal_max": t_max,
                "Q_critical": q_c,
                "shelf_life_days_at_4C": shelf,
            },
        )
    print(f"Seeded {ProductTemplate.objects.count()} product templates.")


if __name__ == "__main__":
    run()
