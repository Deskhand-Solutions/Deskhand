from django.test import TestCase

from apps.core.accounts.constants import RoleSlug
from apps.core.administration.services.membership_service import MembershipService
from apps.core.administration.services.organization_module_service import (
    OrganizationModuleAdminService,
)
from shared.exceptions import DomainValidationError
from shared.test_utils.factories import (
    create_module,
    create_org_member,
    create_test_organization,
    create_test_user,
    enable_module_for_org,
)


class MembershipServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.user = create_test_user(email="member@svc.example")
        self.member = create_org_member(
            user=self.user,
            organization=self.organization,
            role_slug=RoleSlug.USER,
        )

    def test_update_membership_changes_role(self) -> None:
        updated = MembershipService.update_membership(
            member=self.member,
            role_slug=RoleSlug.ORG_ADMIN,
        )

        self.assertEqual(updated.role.slug, RoleSlug.ORG_ADMIN)

    def test_update_membership_unknown_role_raises(self) -> None:
        with self.assertRaises(DomainValidationError):
            MembershipService.update_membership(
                member=self.member,
                role_slug="does-not-exist",
            )

    def test_update_membership_can_deactivate(self) -> None:
        updated = MembershipService.update_membership(
            member=self.member,
            is_active=False,
        )

        self.assertFalse(updated.is_active)


class OrganizationModuleAdminServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.module = create_module(slug="email_marketing")
        self.assignment = enable_module_for_org(
            organization=self.organization,
            module=self.module,
            enabled=False,
        )

    def test_update_assignment_enables_module(self) -> None:
        updated = OrganizationModuleAdminService.update_assignment(
            org_module=self.assignment,
            enabled=True,
        )

        self.assertTrue(updated.enabled)

    def test_update_assignment_sets_config(self) -> None:
        updated = OrganizationModuleAdminService.update_assignment(
            org_module=self.assignment,
            config={"sender": "team@acme.test"},
        )

        self.assertEqual(updated.config, {"sender": "team@acme.test"})
