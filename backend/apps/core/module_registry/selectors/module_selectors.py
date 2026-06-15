from apps.core.module_registry.models import Module, OrganizationModule
from apps.core.module_registry.registry import get_implemented_module_slugs


def get_active_catalog_modules():
    return Module.objects.filter(
        is_active=True,
        slug__in=get_implemented_module_slugs(),
    ).order_by("sort_order", "name")


def get_enabled_modules_for_organization(organization):
    return Module.objects.filter(
        is_active=True,
        slug__in=get_implemented_module_slugs(),
        organization_modules__organization=organization,
        organization_modules__enabled=True,
    ).order_by("sort_order", "name")


def get_enabled_organization_module_links(organization):
    return (
        OrganizationModule.objects.filter(
            organization=organization,
            enabled=True,
            module__is_active=True,
            module__slug__in=get_implemented_module_slugs(),
        )
        .select_related("module")
        .order_by("module__sort_order", "module__name")
    )


def organization_has_module_enabled(organization, module_slug: str) -> bool:
    return OrganizationModule.objects.filter(
        organization=organization,
        module__slug=module_slug,
        module__is_active=True,
        enabled=True,
    ).exists()
