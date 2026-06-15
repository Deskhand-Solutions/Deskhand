from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.module_registry.platform_catalog import ensure_organization_module_assignments

from .models import Organization, OrganizationSettings


@receiver(post_save, sender=Organization)
def provision_organization(sender, instance: Organization, **kwargs) -> None:
    """Einstellungen und Modul-Zuweisungen nach Anlage/Aktualisierung sicherstellen."""
    OrganizationSettings.objects.get_or_create(
        organization=instance,
        defaults={"settings": {}},
    )
    ensure_organization_module_assignments(instance)
