"""
Central registry for AI/LLM providers.

Mirrors ``apps/integrations/registry.py``: each provider lives under
``apps/ai/ai_core/providers/<slug>/`` and registers itself here. Modules obtain
a ready-to-use, organization-keyed client through ``services/llm_router``, never
by instantiating provider classes directly.

Provider slugs must match ``apps.ai.ai_core.models.AIProvider`` values so the
DB ``provider`` field and the registry stay aligned.
"""

from dataclasses import dataclass, field
from typing import Type

from apps.ai.ai_core.services.base import BaseLLMService


@dataclass(frozen=True)
class AIProviderDefinition:
    slug: str
    name: str
    description: str = ""
    client_class: Type[BaseLLMService] | None = None
    default_model: str = ""
    available_models: list[str] = field(default_factory=list)
    requires_api_key: bool = True
    sort_order: int = 0


REGISTERED_AI_PROVIDERS: dict[str, AIProviderDefinition] = {}


def register_ai_provider(definition: AIProviderDefinition) -> None:
    if definition.client_class is None:
        raise ValueError(f"AI provider '{definition.slug}' requires client_class")
    REGISTERED_AI_PROVIDERS[definition.slug] = definition


def get_ai_provider(slug: str) -> AIProviderDefinition:
    try:
        return REGISTERED_AI_PROVIDERS[slug]
    except KeyError as exc:
        from apps.ai.ai_core.exceptions import AIProviderNotRegisteredError

        raise AIProviderNotRegisteredError(f"Unknown AI provider: {slug}") from exc


def get_registered_ai_providers() -> list[AIProviderDefinition]:
    return sorted(REGISTERED_AI_PROVIDERS.values(), key=lambda item: item.sort_order)
