from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.core.accounts.constants import RoleSlug
from apps.ai.ai_core.services.credential_service import AICredentialService
from shared.test_utils.factories import (
    create_org_member,
    create_test_organization,
    create_test_user,
)


class AIOverviewApiTests(APITestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.member = create_test_user(email="member@ai.example")
        create_org_member(
            user=self.member,
            organization=self.organization,
            role_slug=RoleSlug.USER,
        )

    def test_requires_authentication(self) -> None:
        response = self.client.get(reverse("ai-overview"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_masked_overview_for_member(self) -> None:
        AICredentialService.set_credential(
            organization=self.organization, provider="openai", api_key="sk-secret-9999"
        )
        AICredentialService.set_module_binding(
            organization=self.organization,
            module_slug="chatbot",
            provider="openai",
            model="gpt-4o",
        )
        self.client.force_authenticate(user=self.member)

        response = self.client.get(
            reverse("ai-overview"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        providers = {item["slug"]: item for item in response.data["providers"]}
        self.assertTrue(providers["openai"]["configured"])
        self.assertEqual(providers["openai"]["masked_key"], "sk-••••9999")
        # Raw key must never be exposed.
        self.assertNotIn("sk-secret-9999", str(response.data))

        bindings = response.data["module_bindings"]
        self.assertEqual(bindings[0]["module_slug"], "chatbot")
        self.assertEqual(bindings[0]["provider"], "openai")

    def test_cross_org_isolation(self) -> None:
        AICredentialService.set_credential(
            organization=self.organization, provider="openai", api_key="sk-secret-9999"
        )
        other_org = create_test_organization(name="Andere", slug="andere-org")
        other_user = create_test_user(email="other@ai.example")
        create_org_member(
            user=other_user, organization=other_org, role_slug=RoleSlug.USER
        )
        self.client.force_authenticate(user=other_user)

        response = self.client.get(
            reverse("ai-overview"),
            HTTP_X_ORGANIZATION_SLUG=other_org.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        providers = {item["slug"]: item for item in response.data["providers"]}
        self.assertFalse(providers["openai"]["configured"])
