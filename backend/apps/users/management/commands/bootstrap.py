from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run migrate + seed_products + create_admin + seed_demo (idempotent)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("→ migrate"))
        call_command("migrate", "--noinput")

        self.stdout.write(self.style.NOTICE("→ seed_products"))
        try:
            call_command("seed_products")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"seed_products failed: {e}"))

        self.stdout.write(self.style.NOTICE("→ create_admin"))
        try:
            call_command("create_admin")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"create_admin failed: {e}"))

        self.stdout.write(self.style.NOTICE("→ seed_demo"))
        try:
            call_command("seed_demo")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"seed_demo failed: {e}"))

        self.stdout.write(self.style.SUCCESS("Bootstrap complete."))
