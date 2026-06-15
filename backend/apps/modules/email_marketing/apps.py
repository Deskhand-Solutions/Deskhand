from django.apps import AppConfig


class EmailMarketingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.modules.email_marketing"
    label = "email_marketing"

    def ready(self) -> None:
        from apps.core.module_registry.registry import ModuleDefinition, register_module
        from apps.modules.email_marketing.module_config import MODULE_CONFIG

        register_module(ModuleDefinition(**MODULE_CONFIG))
