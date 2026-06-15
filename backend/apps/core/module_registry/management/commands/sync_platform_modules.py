from django.core.management.base import BaseCommand

from apps.core.module_registry.platform_catalog import (
    ensure_organization_module_assignments,
    remove_unregistered_modules_from_db,
    sync_all_registered_modules_to_db,
)
from apps.core.organizations.models import Organization


class Command(BaseCommand):
    help = (
        "Synchronisiert registrierte Module (apps/modules/) mit der Datenbank "
        "und entfernt nicht implementierte Platzhalter-Einträge."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--organization",
            dest="organization_slug",
            help="Modul-Zuweisungen nur für eine Organisation (Slug) prüfen.",
        )

    def handle(self, *args, **options):
        modules = sync_all_registered_modules_to_db()
        removed = remove_unregistered_modules_from_db()

        self.stdout.write(
            self.style.SUCCESS(
                f"{len(modules)} implementierte(s) Modul(e) synchronisiert.",
            ),
        )
        if removed:
            self.stdout.write(
                self.style.WARNING(
                    f"{removed} nicht implementierte Datenbank-Einträge entfernt.",
                ),
            )

        organization_slug = options.get("organization_slug")
        if organization_slug:
            organizations = Organization.objects.filter(slug=organization_slug)
            if not organizations.exists():
                self.stderr.write(
                    self.style.ERROR(f"Organisation '{organization_slug}' nicht gefunden."),
                )
                return
        else:
            organizations = Organization.objects.all()

        for organization in organizations:
            ensure_organization_module_assignments(organization)
            self.stdout.write(f"Modul-Zuweisungen für '{organization.slug}' geprüft.")

        self.stdout.write(self.style.SUCCESS("Synchronisation abgeschlossen."))
