import os

from django.core.management.base import BaseCommand

from apps.users.models import User


class Command(BaseCommand):
    help = "Create or update a superuser from env vars (idempotent)."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@freshfood.uz")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin12345")
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", email)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "is_staff": True,
                "is_superuser": True,
                "role": User.Role.ADMIN,
            },
        )
        if created or not user.has_usable_password():
            user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} superuser: {email}"))
