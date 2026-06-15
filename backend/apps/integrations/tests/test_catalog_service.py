from django.test import TestCase

from apps.integrations.models import IntegrationConnection, IntegrationConnectionStatus
from apps.integrations.services.catalog_service import get_organization_integration_statuses
from shared.test_utils.factories import create_test_organization


class IntegrationCatalogServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_returns_all_registered_providers_as_disconnected_by_default(self) -> None:
        statuses = get_organization_integration_statuses(
            organization_id=self.organization.id,
        )
        slugs = {item.slug for item in statuses}
        self.assertIn("google", slugs)
        self.assertIn("shopify", slugs)
        self.assertTrue(all(not item.connected for item in statuses))

    def test_reflects_connected_status_from_database(self) -> None:
        IntegrationConnection.objects.create(
            organization=self.organization,
            provider_slug="google",
            status=IntegrationConnectionStatus.CONNECTED,
            credentials_encrypted="encrypted-token",
        )

        statuses = get_organization_integration_statuses(
            organization_id=self.organization.id,
        )
        google = next(item for item in statuses if item.slug == "google")
        shopify = next(item for item in statuses if item.slug == "shopify")

        self.assertTrue(google.connected)
        self.assertEqual(google.status, IntegrationConnectionStatus.CONNECTED)
        self.assertFalse(shopify.connected)
