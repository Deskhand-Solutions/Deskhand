from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from shared.test_utils.factories import (
    create_module,
    create_org_member,
    create_test_organization,
    create_test_user,
    enable_module_for_org,
)


class ModuleRegistryApiTests(APITestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user()
        create_org_member(user=self.user, organization=self.organization)
        self.module = create_module(slug="email_marketing")
        enable_module_for_org(organization=self.organization, module=self.module)

    def test_organization_modules_requires_authentication(self) -> None:
        url = reverse(
            "organization-modules",
            kwargs={"organization_slug": self.organization.slug},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_organization_modules_returns_enabled_modules(self) -> None:
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "organization-modules",
            kwargs={"organization_slug": self.organization.slug},
        )

        response = self.client.get(
            url,
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {item["module"]["slug"] for item in response.data}
        self.assertIn("email_marketing", slugs)

    def test_organization_modules_excludes_unregistered_modules(self) -> None:
        chatbot = create_module(slug="chatbot")
        enable_module_for_org(organization=self.organization, module=chatbot)

        self.client.force_authenticate(user=self.user)
        url = reverse(
            "organization-modules",
            kwargs={"organization_slug": self.organization.slug},
        )

        response = self.client.get(
            url,
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {item["module"]["slug"] for item in response.data}
        self.assertNotIn("chatbot", slugs)

    def test_module_catalog_lists_only_registered_modules(self) -> None:
        create_module(slug="chatbot")
        create_module(slug="email_marketing")

        response = self.client.get(reverse("module-catalog"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {item["slug"] for item in response.data}
        self.assertIn("email_marketing", slugs)
        self.assertNotIn("chatbot", slugs)
