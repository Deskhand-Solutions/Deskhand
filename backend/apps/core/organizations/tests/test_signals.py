from django.test import TestCase

from apps.core.accounts.models import User, UserProfile
from apps.core.module_registry.models import OrganizationModule
from apps.core.organizations.models import OrganizationSettings
from shared.test_utils.factories import create_module, create_test_organization


class OrganizationProvisioningTests(TestCase):
    def test_new_organization_gets_settings_and_module_slots(self) -> None:
        create_module(slug="email_marketing", name="E-Mail Marketing")

        organization = create_test_organization(name="Acme GmbH", slug="acme-gmbh")

        self.assertTrue(
            OrganizationSettings.objects.filter(organization=organization).exists()
        )
        self.assertTrue(
            OrganizationModule.objects.filter(
                organization=organization,
                module__slug="email_marketing",
            ).exists()
        )

    def test_existing_organization_gets_missing_module_slots_on_save(self) -> None:
        create_module(slug="email_marketing", name="E-Mail Marketing")
        organization = create_test_organization(name="Legacy", slug="legacy")

        OrganizationModule.objects.filter(organization=organization).delete()
        organization.name = "Legacy AG"
        organization.save()

        self.assertTrue(
            OrganizationModule.objects.filter(
                organization=organization,
                module__slug="email_marketing",
            ).exists()
        )


class UserProfileSignalTests(TestCase):
    def test_user_creation_creates_profile(self) -> None:
        user = User.objects.create_user(
            email="profile@example.com",
            password="secure-password-123",
            first_name="Max",
            last_name="Mustermann",
        )

        self.assertTrue(UserProfile.objects.filter(user=user).exists())
