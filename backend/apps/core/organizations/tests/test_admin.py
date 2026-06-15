from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from apps.ai.ai_core.admin import AIProviderCredentialInlineForm
from apps.integrations.admin import IntegrationConnectionInlineForm
from shared.test_utils.factories import create_test_organization

User = get_user_model()


class DeskhandOrganizationAdminTests(TestCase):
    def setUp(self) -> None:
        self.superuser = User.objects.create_superuser(
            email="staff@deskhand.example", password="StaffPass123!"
        )
        self.organization = create_test_organization()
        self.client.force_login(self.superuser)

    def test_start_page_renders(self) -> None:
        response = self.client.get(reverse("deskhand_admin:index"))
        self.assertEqual(response.status_code, 200)

    def test_org_change_page_bundles_config_inlines(self) -> None:
        url = reverse(
            "deskhand_admin:organizations_organization_change",
            args=[self.organization.pk],
        )
        response = self.client.get(url)
        html = response.content.decode("utf-8")

        self.assertEqual(response.status_code, 200)
        # Everything for the organization is on one page.
        self.assertIn("KI-API-Keys", html)
        self.assertIn("Integrationen", html)
        self.assertIn("Modul", html)
        # Object-level delete button is removed in the friendly admin
        # (inline "Löschen"-checkboxes stay — they use a different markup).
        delete_url = reverse(
            "deskhand_admin:organizations_organization_delete",
            args=[self.organization.pk],
        )
        self.assertNotIn(delete_url, html)
        # Slug help text is shown.
        self.assertIn("Technischer Kurzname", html)


class AIProviderCredentialInlineFormTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_inline_form_encrypts_api_key(self) -> None:
        form = AIProviderCredentialInlineForm(
            data={
                "provider": "openai",
                "label": "Haupt-Key",
                "api_key": "sk-test-abcd1234",
                "base_url": "",
                "is_active": True,
            }
        )
        self.assertTrue(form.is_valid(), form.errors)
        instance = form.save(commit=False)
        instance.organization = self.organization
        instance.save()

        self.assertNotIn("sk-test-abcd1234", instance.api_key_encrypted)
        self.assertEqual(instance.key_last4, "1234")
        self.assertEqual(instance.masked_key, "sk-••••1234")


class IntegrationConnectionInlineFormTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

    def test_inline_form_encrypts_secret(self) -> None:
        form = IntegrationConnectionInlineForm(
            data={
                "provider_slug": "google",
                "status": "connected",
                "cred_client_id": "cid",
                "cred_client_secret": "client-secret-1234",
                "cred_refresh_token": "rtok-1234",
            }
        )
        self.assertTrue(form.is_valid(), form.errors)
        instance = form.save(commit=False)
        instance.organization = self.organization
        instance.save()

        self.assertNotIn("client-secret-1234", instance.credentials_encrypted)
        self.assertEqual(instance.metadata["masked"], "••••••••1234")
