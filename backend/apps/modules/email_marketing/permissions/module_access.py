from rest_framework.permissions import BasePermission

from apps.core.module_registry.services import ModuleAccessService

MODULE_SLUG = "email_marketing"


class RequiresEmailMarketingModule(BasePermission):
    message = "Modul ist für diese Organisation nicht freigeschaltet."

    def has_permission(self, request, view) -> bool:
        organization = getattr(request, "organization", None)
        if organization is None:
            return False
        return ModuleAccessService.is_enabled(organization, MODULE_SLUG)
