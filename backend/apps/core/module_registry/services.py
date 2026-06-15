from apps.core.module_registry.registry import get_implemented_module_slugs
from apps.core.module_registry.selectors.module_selectors import (
    get_enabled_modules_for_organization,
    organization_has_module_enabled,
)
from shared.exceptions import ModuleNotEnabledError


class ModuleAccessService:
    @staticmethod
    def is_enabled(organization, module_slug: str) -> bool:
        if module_slug not in get_implemented_module_slugs():
            return False
        return organization_has_module_enabled(organization, module_slug)

    @staticmethod
    def ensure_enabled(organization, module_slug: str) -> None:
        if not ModuleAccessService.is_enabled(organization, module_slug):
            raise ModuleNotEnabledError(
                f"Modul '{module_slug}' ist für diese Organisation nicht freigeschaltet."
            )

    @staticmethod
    def get_enabled_modules(organization):
        return get_enabled_modules_for_organization(organization)
