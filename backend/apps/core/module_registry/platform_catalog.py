"""
Synchronisiert implementierte Module (Code-Registry) mit der Datenbank.

Nur Module, die sich via register_module() in apps/modules/<name>/apps.py
registrieren, existieren auf der Plattform. Keine hardcodierten Platzhalter.
"""

from __future__ import annotations

from apps.core.module_registry.models import Module, OrganizationModule
from apps.core.module_registry.registry import (
    ModuleDefinition,
    get_implemented_module_slugs,
    get_registered_modules,
)


def sync_module_to_db(definition: ModuleDefinition) -> Module:
    module, _ = Module.objects.update_or_create(
        slug=definition.slug,
        defaults={
            "name": definition.name,
            "description": definition.description,
            "icon": definition.icon,
            "version": "1.0.0",
            "sort_order": definition.sort_order,
            "is_active": True,
        },
    )
    return module


def sync_all_registered_modules_to_db() -> list[Module]:
    return [sync_module_to_db(definition) for definition in get_registered_modules()]


def remove_unregistered_modules_from_db() -> int:
    slugs = get_implemented_module_slugs()
    queryset = Module.objects.exclude(slug__in=slugs)
    count, _ = queryset.delete()
    return count


def ensure_organization_module_assignments(organization) -> None:
    for module in Module.objects.filter(
        is_active=True,
        slug__in=get_implemented_module_slugs(),
    ):
        OrganizationModule.objects.get_or_create(
            organization=organization,
            module=module,
            defaults={"enabled": False},
        )
