from django.test import TestCase

from apps.integrations.exceptions import IntegrationNotConnectedError
from apps.integrations.models import IntegrationConnection, IntegrationConnectionStatus
from apps.integrations.services.connection_service import (
    get_client_for_organization,
    set_connection_credentials,
)
from shared.test_utils.factories import create_test_organization


class IntegrationConnectionServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_raises_when_provider_not_connected(self) -> None:
        with self.assertRaises(IntegrationNotConnectedError):
            get_client_for_organization(
                organization_id=self.organization.id,
                provider_slug="google",
            )

    def test_set_credentials_round_trip(self) -> None:
        set_connection_credentials(
            organization=self.organization,
            provider_slug="google",
            credentials={
                "client_id": "cid",
                "client_secret": "client-secret-1234",
                "refresh_token": "rtok-1234",
            },
        )

        client = get_client_for_organization(
            organization_id=self.organization.id,
            provider_slug="google",
        )

        self.assertEqual(client.provider_slug, "google")
        self.assertTrue(client.is_configured)

    def test_set_credentials_encrypts_at_rest(self) -> None:
        set_connection_credentials(
            organization=self.organization,
            provider_slug="google",
            credentials={
                "client_id": "cid",
                "client_secret": "client-secret-1234",
                "refresh_token": "rtok-1234",
            },
        )

        connection = IntegrationConnection.objects.get(
            organization=self.organization, provider_slug="google"
        )
        self.assertNotIn("client-secret-1234", connection.credentials_encrypted)
        self.assertEqual(connection.metadata["masked"], "••••••••1234")
        self.assertEqual(connection.status, IntegrationConnectionStatus.CONNECTED)

    def test_allow_disconnected_client_when_require_connected_false(self) -> None:
        client = get_client_for_organization(
            organization_id=self.organization.id,
            provider_slug="shopify",
            require_connected=False,
        )

        self.assertEqual(client.provider_slug, "shopify")
        self.assertFalse(client.is_configured)

    def test_legacy_plaintext_token_still_readable(self) -> None:
        # Rows written before structured/encrypted storage must stay usable.
        IntegrationConnection.objects.create(
            organization=self.organization,
            provider_slug="google",
            status=IntegrationConnectionStatus.CONNECTED,
            credentials_encrypted="token-123",
        )

        client = get_client_for_organization(
            organization_id=self.organization.id,
            provider_slug="google",
        )

        self.assertTrue(client.is_configured)
