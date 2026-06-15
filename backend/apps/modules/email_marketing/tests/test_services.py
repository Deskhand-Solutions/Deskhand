from django.test import TestCase

from apps.modules.email_marketing.models import EmailProjectStatus
from apps.modules.email_marketing.services import EmailGenerationService, EmailProjectService
from shared.test_utils.factories import (
    create_module,
    create_org_member,
    create_test_organization,
    create_test_user,
    enable_module_for_org,
)


class EmailProjectServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user()
        create_org_member(user=self.user, organization=self.organization)

    def test_create_and_update_project(self) -> None:
        project = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Launch Campaign",
            context="Neues Produkt für SaaS-Teams.",
            style_guidelines="Modern, blau, freundlich",
        )
        self.assertEqual(project.status, EmailProjectStatus.DRAFT)

        updated = EmailProjectService.update_project(
            organization_id=self.organization.id,
            project_id=project.id,
            data={"html_content": "<html><body>Test</body></html>"},
        )
        self.assertEqual(updated.status, EmailProjectStatus.GENERATED)
        self.assertIn("Test", updated.html_content)

    def test_create_project_with_duplicate_title_auto_renames(self) -> None:
        p1 = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Campaign Q2",
        )
        p2 = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Campaign Q2",
        )
        self.assertEqual(p1.title, "Campaign Q2")
        self.assertEqual(p2.title, "Campaign Q2 (2)")


class EmailGenerationServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user()
        create_org_member(user=self.user, organization=self.organization)
        module = create_module(slug="email_marketing")
        enable_module_for_org(organization=self.organization, module=module)

    def test_generate_html_from_context(self) -> None:
        project = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Summer Sale",
            context="20% Rabatt auf alle Jahrespläne bis Freitag.",
            style_guidelines="Accent #2563eb, clean layout",
            subject_line="Summer Sale — 20% Rabatt",
        )

        service = EmailGenerationService(organization=self.organization)
        result = service.generate_html(project)

        self.assertEqual(result.status, EmailProjectStatus.GENERATED)
        self.assertIn("<!DOCTYPE html>", result.html_content)
        self.assertIn("Summer Sale", result.html_content)

    def test_generate_html_with_refinement(self) -> None:
        project = EmailProjectService.create_project(
            organization=self.organization,
            created_by=self.user,
            title="Summer Sale",
            context="20% Rabatt auf alle Jahrespläne bis Freitag.",
            style_guidelines="Accent #2563eb, clean layout",
            subject_line="Summer Sale — 20% Rabatt",
        )
        project.html_content = "<html><body>Original content</body></html>"
        project.save()

        service = EmailGenerationService(organization=self.organization)
        result = service.generate_html(project, refinement_prompt="Button rot färben")

        self.assertEqual(result.status, EmailProjectStatus.GENERATED)
        self.assertIn("Korrektur angewendet: „Button rot färben“", result.html_content)
