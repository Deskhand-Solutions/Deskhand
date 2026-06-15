from apps.core.module_registry.models import OrganizationModule


class OrganizationModuleAdminService:
    """Write-path orchestration for per-organization module assignments."""

    @staticmethod
    def update_assignment(
        *,
        org_module: OrganizationModule,
        enabled: bool | None = None,
        config: dict | None = None,
    ) -> OrganizationModule:
        if enabled is not None:
            org_module.enabled = bool(enabled)
        if config is not None:
            org_module.config = config
        org_module.save()
        return org_module
