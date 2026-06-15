from apps.ai.ai_core.models import AIProviderCredential, ModuleAIBinding
from apps.core.administration.services.audit_service import AuditService
from shared.security import get_secrets_cipher, key_fingerprint


class AICredentialService:
    """Writes for AI provider credentials and module→AI routing (encrypts keys)."""

    @staticmethod
    def set_credential(
        *,
        organization,
        provider: str,
        api_key: str,
        label: str = "",
        base_url: str = "",
        is_active: bool = True,
        created_by=None,
    ) -> AIProviderCredential:
        cipher = get_secrets_cipher()
        prefix, last4 = key_fingerprint(api_key)
        credential, _ = AIProviderCredential.objects.update_or_create(
            organization=organization,
            provider=provider,
            defaults={
                "api_key_encrypted": cipher.encrypt(api_key) if api_key else "",
                "key_prefix": prefix,
                "key_last4": last4,
                "label": label,
                "base_url": base_url,
                "is_active": is_active,
                "created_by": created_by,
            },
        )
        AuditService.log(
            action="ai_credential.set",
            resource_type="ai_provider_credential",
            resource_id=str(credential.id),
            user=created_by,
            organization=organization,
            metadata={"provider": provider},
        )
        return credential

    @staticmethod
    def get_api_key(credential: AIProviderCredential) -> str:
        """Decrypt the stored key for use by a provider client."""
        return get_secrets_cipher().decrypt(credential.api_key_encrypted)

    @staticmethod
    def delete_credential(*, organization, provider: str, user=None) -> None:
        deleted, _ = AIProviderCredential.objects.filter(
            organization=organization,
            provider=provider,
        ).delete()
        if deleted:
            AuditService.log(
                action="ai_credential.delete",
                resource_type="ai_provider_credential",
                user=user,
                organization=organization,
                metadata={"provider": provider},
            )

    @staticmethod
    def set_module_binding(
        *,
        organization,
        module_slug: str,
        provider: str,
        model: str = "",
        user=None,
    ) -> ModuleAIBinding:
        binding, _ = ModuleAIBinding.objects.update_or_create(
            organization=organization,
            module_slug=module_slug,
            defaults={"provider": provider, "model": model},
        )
        AuditService.log(
            action="ai_binding.set",
            resource_type="module_ai_binding",
            resource_id=str(binding.id),
            user=user,
            organization=organization,
            metadata={"module_slug": module_slug, "provider": provider, "model": model},
        )
        return binding
