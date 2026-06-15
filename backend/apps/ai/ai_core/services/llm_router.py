"""
Module-facing entry point for AI.

A module gets a ready-to-use, organization-keyed LLM client in one call —
without ever touching provider SDKs, API keys, or model selection:

    from apps.ai.ai_core.services.llm_router import LLMRouter

    response = LLMRouter.generate_for_module(
        organization=org,
        module_slug="chatbot",
        prompt=prompt,
    )

Routing resolves: ModuleAIBinding (org-specific) → DESKHAND_DEFAULT_AI_PROVIDER
→ provider registry → decrypted AIProviderCredential → configured client.
"""

from django.conf import settings

from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.registry import get_ai_provider
from apps.ai.ai_core.selectors import get_credential, get_module_binding
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse
from apps.ai.ai_core.services.credential_service import AICredentialService
from apps.ai.ai_core.services.usage import UsageTrackingService

_LOCAL_PROVIDER = "local"


class LLMRouter:
    @staticmethod
    def get_llm_for_module(
        *,
        organization,
        module_slug: str,
        fallback_to_local: bool = True,
    ) -> BaseLLMService:
        binding = get_module_binding(
            organization_id=organization.id,
            module_slug=module_slug,
        )
        if binding is not None:
            provider_slug = binding.provider
            model = binding.model
        else:
            provider_slug = getattr(
                settings, "DESKHAND_DEFAULT_AI_PROVIDER", _LOCAL_PROVIDER
            )
            model = ""

        return LLMRouter._build_client(
            organization=organization,
            provider_slug=provider_slug,
            model=model,
            fallback_to_local=fallback_to_local,
        )

    @staticmethod
    def _build_client(
        *,
        organization,
        provider_slug: str,
        model: str,
        fallback_to_local: bool,
    ) -> BaseLLMService:
        definition = get_ai_provider(provider_slug)

        if not definition.requires_api_key:
            return definition.client_class(model=model)

        credential = get_credential(
            organization_id=organization.id,
            provider=provider_slug,
        )
        api_key = (
            AICredentialService.get_api_key(credential)
            if credential is not None and credential.is_active
            else ""
        )

        if not api_key:
            if fallback_to_local:
                return get_ai_provider(_LOCAL_PROVIDER).client_class(model=model)
            raise AIProviderNotConfiguredError(
                f"No active '{provider_slug}' credential for organization "
                f"{organization.id}.",
            )

        return definition.client_class(
            api_key=api_key,
            model=model,
            base_url=credential.base_url,
        )

    @staticmethod
    def generate_for_module(
        *,
        organization,
        module_slug: str,
        prompt: str,
        fallback_to_local: bool = True,
    ) -> LLMResponse:
        """Generate + usage tracking in one call (recommended for modules)."""
        llm = LLMRouter.get_llm_for_module(
            organization=organization,
            module_slug=module_slug,
            fallback_to_local=fallback_to_local,
        )
        response = llm.generate(prompt)
        UsageTrackingService.track(
            organization=organization,
            module_slug=module_slug,
            provider=llm.provider_name,
            model=response.model,
            tokens_input=response.tokens_input,
            tokens_output=response.tokens_output,
        )
        return response


def get_llm_for_module(
    *,
    organization,
    module_slug: str,
    fallback_to_local: bool = True,
) -> BaseLLMService:
    """Convenience wrapper around ``LLMRouter.get_llm_for_module``."""
    return LLMRouter.get_llm_for_module(
        organization=organization,
        module_slug=module_slug,
        fallback_to_local=fallback_to_local,
    )
