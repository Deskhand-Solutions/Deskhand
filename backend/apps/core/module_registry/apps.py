from django.apps import AppConfig


class ModuleRegistryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core.module_registry"
    label = "module_registry"
    verbose_name = "Modul-Registry"
