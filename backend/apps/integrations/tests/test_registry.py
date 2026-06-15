from django.test import TestCase

from apps.integrations.exceptions import IntegrationNotRegisteredError
from apps.integrations.registry import get_integration, get_registered_integrations


class IntegrationRegistryTests(TestCase):
    def test_builtin_providers_are_registered(self) -> None:
        slugs = {item.slug for item in get_registered_integrations()}
        self.assertIn("google", slugs)
        self.assertIn("microsoft", slugs)
        self.assertIn("shopify", slugs)
        self.assertIn("sap", slugs)
        self.assertEqual(len(slugs), 4)

    def test_get_integration_returns_client_class(self) -> None:
        definition = get_integration("google")
        self.assertEqual(definition.slug, "google")
        self.assertIsNotNone(definition.client_class)

    def test_unknown_provider_raises(self) -> None:
        with self.assertRaises(IntegrationNotRegisteredError):
            get_integration("unknown-provider")
