"""Read model for the customer-facing (read-only) AI configuration view."""

from dataclasses import dataclass

from apps.ai.ai_core.registry import get_registered_ai_providers
from apps.ai.ai_core.selectors import list_credentials, list_module_bindings


@dataclass(frozen=True)
class AIProviderOverview:
    slug: str
    name: str
    description: str
    requires_api_key: bool
    configured: bool
    is_active: bool
    masked_key: str
    label: str
    default_model: str
    available_models: list[str]


@dataclass(frozen=True)
class ModuleBindingOverview:
    module_slug: str
    provider: str
    provider_name: str
    model: str


def get_organization_ai_overview(*, organization_id) -> dict:
    """Provider keys (masked) + module→AI routing for an organization."""
    credentials = {
        credential.provider: credential
        for credential in list_credentials(organization_id=organization_id)
    }
    provider_names = {}
    providers: list[AIProviderOverview] = []
    for definition in get_registered_ai_providers():
        provider_names[definition.slug] = definition.name
        credential = credentials.get(definition.slug)
        providers.append(
            AIProviderOverview(
                slug=definition.slug,
                name=definition.name,
                description=definition.description,
                requires_api_key=definition.requires_api_key,
                configured=credential is not None,
                is_active=bool(credential and credential.is_active),
                masked_key=credential.masked_key if credential else "",
                label=credential.label if credential else "",
                default_model=definition.default_model,
                available_models=list(definition.available_models),
            )
        )

    bindings = [
        ModuleBindingOverview(
            module_slug=binding.module_slug,
            provider=binding.provider,
            provider_name=provider_names.get(binding.provider, binding.provider),
            model=binding.model,
        )
        for binding in list_module_bindings(organization_id=organization_id)
    ]

    return {"providers": providers, "module_bindings": bindings}
