from django.apps import AppConfig


class AiCoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ai.ai_core"
    label = "ai_core"
    verbose_name = "KI-Kern"

    def ready(self) -> None:
        # Registers built-in AI providers (openai, anthropic, google, local).
        from apps.ai.ai_core.providers import register_builtin_ai_providers

        register_builtin_ai_providers()
