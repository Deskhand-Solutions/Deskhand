from django.apps import AppConfig


class AdministrationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core.administration"
    label = "administration"
    verbose_name = "Administration"

    def ready(self) -> None:
        from config.admin_sites import register_deskhand_admin_models

        register_deskhand_admin_models()
