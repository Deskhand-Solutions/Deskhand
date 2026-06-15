from django.apps import AppConfig


class IntegrationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.integrations"
    label = "integrations"
    verbose_name = "Externe Integrationen"

    def ready(self) -> None:
        # Registers built-in providers (google, shopify, …) on startup.
        from apps.integrations.providers import register_builtin_providers

        register_builtin_providers()

        # Dynamically attach fields to forms now that the registry is filled
        from apps.integrations.admin import register_dynamic_fields
        register_dynamic_fields()

