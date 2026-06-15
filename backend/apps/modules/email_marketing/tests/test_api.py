from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.modules.email_marketing.services import EmailProjectService
from shared.test_utils.factories import (
    create_module,
    create_org_member,
    create_test_organization,
    create_test_user,
    enable_module_for_org,
)


class EmailMarketingApiTests(APITestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user()
        create_org_member(user=self.user, organization=self.organization)
        self.module = create_module(slug="email_marketing", name="E-Mail-Marketing")
        enable_module_for_org(organization=self.organization, module=self.module)
        self.client.force_authenticate(user=self.user)
        self.org_header = {"HTTP_X_ORGANIZATION_SLUG": self.organization.slug}

    def test_projects_require_auth(self) -> None:
        self.client.force_authenticate(user=None)
        url = reverse("email-project-list")
        response = self.client.get(url, **self.org_header)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_and_list_projects(self) -> None:
        url = reverse("email-project-list")
        create_response = self.client.post(
            url,
            {
                "title": "Newsletter Q2",
                "context": "Produktupdate und Kundenstory.",
                "style_guidelines": "Minimal, weiß, blauer CTA",
            },
            format="json",
            **self.org_header,
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["title"], "Newsletter Q2")

        list_response = self.client.get(url, **self.org_header)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_rename_to_duplicate_title_returns_400(self) -> None:
        p1 = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Promo A",
        )
        p2 = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Promo B",
        )
        url = reverse("email-project-detail", kwargs={"project_id": p2.id})
        response = self.client.patch(
            url,
            {"title": "Promo A"},
            format="json",
            **self.org_header,
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Ein Projekt mit diesem Namen existiert bereits.")

    def test_generate_endpoint_returns_html(self) -> None:
        project = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Promo",
            context="Launch event next week with live demo.",
        )
        url = reverse("email-project-generate", kwargs={"project_id": project.id})
        response = self.client.post(url, format="json", **self.org_header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("html_content", response.data)
        self.assertTrue(response.data["html_content"].startswith("<!DOCTYPE html>"))

    def test_generate_endpoint_with_refinement(self) -> None:
        project = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Promo",
            context="Launch event next week with live demo.",
        )
        project.html_content = "<html><body>Promo draft</body></html>"
        project.save()

        url = reverse("email-project-generate", kwargs={"project_id": project.id})
        response = self.client.post(
            url,
            {"refinement_prompt": "Schriftart vergrößern"},
            format="json",
            **self.org_header
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("html_content", response.data)
        self.assertIn("Korrektur angewendet: „Schriftart vergrößern“", response.data["html_content"])

    def test_module_disabled_returns_403(self) -> None:
        enable_module_for_org(
            organization=self.organization,
            module=self.module,
            enabled=False,
        )
        url = reverse("email-project-list")
        response = self.client.get(url, **self.org_header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
