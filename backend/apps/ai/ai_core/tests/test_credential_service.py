from django.test import TestCase

from apps.ai.ai_core.models import AIProviderCredential
from apps.ai.ai_core.services.credential_service import AICredentialService
from shared.test_utils.factories import create_test_organization


class AICredentialServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_set_credential_encrypts_and_masks(self) -> None:
        credential = AICredentialService.set_credential(
            organization=self.organization,
            provider="openai",
            api_key="sk-test-abcd1234",
        )
        # Stored value is never the raw key.
        self.assertNotEqual(credential.api_key_encrypted, "sk-test-abcd1234")
        self.assertNotIn("sk-test-abcd1234", credential.api_key_encrypted)
        # Masked display without decrypting.
        self.assertEqual(credential.key_prefix, "sk-")
        self.assertEqual(credential.key_last4, "1234")
        self.assertEqual(credential.masked_key, "sk-••••1234")
        # Round-trip decryption for provider clients.
        self.assertEqual(
            AICredentialService.get_api_key(credential),
            "sk-test-abcd1234",
        )

    def test_set_credential_is_idempotent_per_provider(self) -> None:
        AICredentialService.set_credential(
            organization=self.organization, provider="openai", api_key="sk-aaaa1111"
        )
        AICredentialService.set_credential(
            organization=self.organization, provider="openai", api_key="sk-bbbb2222"
        )
        self.assertEqual(
            AIProviderCredential.objects.filter(
                organization=self.organization, provider="openai"
            ).count(),
            1,
        )

    def test_set_module_binding(self) -> None:
        binding = AICredentialService.set_module_binding(
            organization=self.organization,
            module_slug="chatbot",
            provider="anthropic",
            model="claude-sonnet-4-6",
        )
        self.assertEqual(binding.provider, "anthropic")
        self.assertEqual(binding.model, "claude-sonnet-4-6")
