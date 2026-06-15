from django.test import SimpleTestCase

from apps.ai.ai_core.exceptions import AIProviderNotRegisteredError
from apps.ai.ai_core.registry import get_ai_provider, get_registered_ai_providers


class AIRegistryTests(SimpleTestCase):
    def test_builtin_providers_registered(self) -> None:
        slugs = {provider.slug for provider in get_registered_ai_providers()}
        self.assertTrue({"openai", "anthropic", "google", "local"}.issubset(slugs))

    def test_get_unknown_provider_raises(self) -> None:
        with self.assertRaises(AIProviderNotRegisteredError):
            get_ai_provider("does-not-exist")

    def test_local_provider_requires_no_key(self) -> None:
        self.assertFalse(get_ai_provider("local").requires_api_key)

    def test_openai_provider_has_default_model(self) -> None:
        self.assertTrue(get_ai_provider("openai").default_model)
