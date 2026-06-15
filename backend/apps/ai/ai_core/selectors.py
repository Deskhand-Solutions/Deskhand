from django.db.models import QuerySet

from apps.ai.ai_core.models import AIProviderCredential, ModuleAIBinding


def get_credential(
    *,
    organization_id,
    provider: str,
) -> AIProviderCredential | None:
    return AIProviderCredential.objects.filter(
        organization_id=organization_id,
        provider=provider,
    ).first()


def list_credentials(*, organization_id) -> QuerySet[AIProviderCredential]:
    return AIProviderCredential.objects.filter(
        organization_id=organization_id,
    ).order_by("provider")


def get_module_binding(
    *,
    organization_id,
    module_slug: str,
) -> ModuleAIBinding | None:
    return ModuleAIBinding.objects.filter(
        organization_id=organization_id,
        module_slug=module_slug,
    ).first()


def list_module_bindings(*, organization_id) -> QuerySet[ModuleAIBinding]:
    return ModuleAIBinding.objects.filter(
        organization_id=organization_id,
    ).order_by("module_slug")
