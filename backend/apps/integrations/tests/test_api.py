from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from shared.test_utils.factories import (
    create_org_member,
    create_test_organization,
    create_test_user,
)


class IntegrationApiTests(APITestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user()
        create_org_member(user=self.user, organization=self.organization)

    def test_catalog_is_public(self) -> None:
        response = self.client.get(reverse("integration-catalog"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {item["slug"] for item in response.data}
        self.assertIn("google", slugs)
        self.assertIn("microsoft", slugs)
        self.assertIn("shopify", slugs)
        self.assertIn("sap", slugs)
        self.assertEqual(len(slugs), 4)

    def test_organization_integrations_requires_auth(self) -> None:
        url = reverse(
            "organization-integrations",
            kwargs={"organization_slug": self.organization.slug},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_organization_integrations_returns_status_for_member(self) -> None:
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "organization-integrations",
            kwargs={"organization_slug": self.organization.slug},
        )

        response = self.client.get(
            url,
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)
        self.assertTrue(
            all("slug" in item and "connected" in item for item in response.data),
        )

