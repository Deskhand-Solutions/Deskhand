from django.apps import AppConfig


class OrganizationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core.organizations"
    label = "organizations"
    verbose_name = "Organisationen"

    def ready(self) -> None:
        from . import signals  # noqa: F401
