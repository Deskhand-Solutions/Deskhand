from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core.accounts"
    label = "accounts"
    verbose_name = "Benutzerkonten"

    def ready(self) -> None:
        from . import signals  # noqa: F401
