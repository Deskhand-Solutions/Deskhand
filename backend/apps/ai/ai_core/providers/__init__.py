from apps.ai.ai_core.providers.anthropic.client import AnthropicLLMService
from apps.ai.ai_core.providers.google.client import GoogleLLMService
from apps.ai.ai_core.providers.local.client import LocalLLMService
from apps.ai.ai_core.providers.openai.client import OpenAILLMService
from apps.ai.ai_core.registry import AIProviderDefinition, register_ai_provider


def register_builtin_ai_providers() -> None:
    register_ai_provider(
        AIProviderDefinition(
            slug="openai",
            name="OpenAI",
            description="GPT-Modelle von OpenAI (Chat Completions API).",
            client_class=OpenAILLMService,
            default_model=OpenAILLMService.default_model,
            available_models=["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"],
            sort_order=10,
        )
    )
    register_ai_provider(
        AIProviderDefinition(
            slug="anthropic",
            name="Anthropic",
            description="Claude-Modelle von Anthropic (Messages API).",
            client_class=AnthropicLLMService,
            default_model=AnthropicLLMService.default_model,
            available_models=[
                "claude-opus-4-8",
                "claude-sonnet-4-6",
                "claude-haiku-4-5-20251001",
            ],
            sort_order=20,
        )
    )
    register_ai_provider(
        AIProviderDefinition(
            slug="google",
            name="Google Gemini",
            description="Gemini-Modelle von Google (Generative Language API).",
            client_class=GoogleLLMService,
            default_model=GoogleLLMService.default_model,
            available_models=["gemini-1.5-flash", "gemini-1.5-pro"],
            sort_order=30,
        )
    )
    register_ai_provider(
        AIProviderDefinition(
            slug="local",
            name="Lokal",
            description="Offline-Fallback ohne externen API-Key (deterministisch).",
            client_class=LocalLLMService,
            default_model=LocalLLMService.default_model,
            requires_api_key=False,
            sort_order=90,
        )
    )
