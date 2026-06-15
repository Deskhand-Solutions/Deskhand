from django.test import TestCase

from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.models import AIUsageRecord
from apps.ai.ai_core.services.credential_service import AICredentialService
from apps.ai.ai_core.services.llm_router import LLMRouter, get_llm_for_module
from shared.test_utils.factories import create_test_organization


class LLMRouterTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_falls_back_to_local_without_binding(self) -> None:
        llm = get_llm_for_module(organization=self.organization, module_slug="chatbot")
        self.assertEqual(llm.provider_name, "local")

    def test_binding_with_credential_builds_provider_client(self) -> None:
        AICredentialService.set_credential(
            organization=self.organization, provider="openai", api_key="sk-test-1234"
        )
        AICredentialService.set_module_binding(
            organization=self.organization,
            module_slug="chatbot",
            provider="openai",
            model="gpt-4o",
        )
        llm = get_llm_for_module(organization=self.organization, module_slug="chatbot")
        self.assertEqual(llm.provider_name, "openai")
        self.assertTrue(llm.is_configured)

    def test_binding_without_credential_falls_back_to_local(self) -> None:
        AICredentialService.set_module_binding(
            organization=self.organization, module_slug="chatbot", provider="openai"
        )
        llm = get_llm_for_module(organization=self.organization, module_slug="chatbot")
        self.assertEqual(llm.provider_name, "local")

    def test_binding_without_credential_raises_when_no_fallback(self) -> None:
        AICredentialService.set_module_binding(
            organization=self.organization, module_slug="chatbot", provider="openai"
        )
        with self.assertRaises(AIProviderNotConfiguredError):
            get_llm_for_module(
                organization=self.organization,
                module_slug="chatbot",
                fallback_to_local=False,
            )

    def test_generate_for_module_tracks_usage(self) -> None:
        response = LLMRouter.generate_for_module(
            organization=self.organization,
            module_slug="chatbot",
            prompt="Hallo Welt",
        )
        self.assertTrue(response.content)
        self.assertEqual(
            AIUsageRecord.objects.filter(
                organization=self.organization, module_slug="chatbot"
            ).count(),
            1,
        )
