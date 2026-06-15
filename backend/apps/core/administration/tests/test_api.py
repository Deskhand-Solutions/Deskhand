from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.core.accounts.constants import RoleSlug
from apps.core.organizations.models import OrganizationMember
from shared.test_utils.factories import (
    create_org_member,
    create_test_organization,
    create_test_user,
)


class AdministrationApiTests(APITestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.admin = create_test_user(email="admin@test.example")
        self.member = create_test_user(email="member@test.example")
        create_org_member(
            user=self.admin,
            organization=self.organization,
            role_slug=RoleSlug.ORG_ADMIN,
        )
        create_org_member(
            user=self.member,
            organization=self.organization,
            role_slug=RoleSlug.USER,
        )

    def _member_record(self) -> OrganizationMember:
        return OrganizationMember.objects.get(
            user=self.member,
            organization=self.organization,
        )

    def test_dashboard_requires_authentication(self) -> None:
        response = self.client.get(reverse("dashboard"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_returns_data_for_org_member(self) -> None:
        self.client.force_authenticate(user=self.member)

        response = self.client.get(
            reverse("dashboard"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("subscription", response.data)

    def test_audit_logs_require_org_admin(self) -> None:
        self.client.force_authenticate(user=self.member)

        response = self.client.get(
            reverse("audit-logs-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_audit_logs_accessible_for_org_admin(self) -> None:
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse("audit-logs-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_api_keys_accessible_for_super_admin_role(self) -> None:
        super_admin = create_test_user(email="superadmin@test.example")
        create_org_member(
            user=super_admin,
            organization=self.organization,
            role_slug=RoleSlug.SUPER_ADMIN,
        )
        self.client.force_authenticate(user=super_admin)

        response = self.client.get(
            reverse("api-keys-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_member_role_update_by_admin_succeeds(self) -> None:
        self.client.force_authenticate(user=self.admin)
        member = self._member_record()

        response = self.client.patch(
            reverse("members-detail", args=[member.id]),
            {"role_slug": RoleSlug.ORG_ADMIN},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        member.refresh_from_db()
        self.assertEqual(member.role.slug, RoleSlug.ORG_ADMIN)

    def test_member_role_update_unknown_role_returns_400(self) -> None:
        self.client.force_authenticate(user=self.admin)
        member = self._member_record()

        response = self.client.patch(
            reverse("members-detail", args=[member.id]),
            {"role_slug": "does-not-exist"},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_update_forbidden_for_non_admin(self) -> None:
        self.client.force_authenticate(user=self.member)
        member = self._member_record()

        response = self.client.patch(
            reverse("members-detail", args=[member.id]),
            {"is_active": False},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_update_cross_organization_returns_404(self) -> None:
        other_org = create_test_organization(name="Andere", slug="andere-org")
        other_user = create_test_user(email="other@test.example")
        other_member = create_org_member(
            user=other_user,
            organization=other_org,
            role_slug=RoleSlug.USER,
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("members-detail", args=[other_member.id]),
            {"is_active": False},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_widgets_initializes_defaults(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        self.client.force_authenticate(user=self.member)
        response = self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("active", response.data)
        self.assertIn("available", response.data)
        
        # Verify default widgets are created for the user
        active_slugs = [w["widget_type"] for w in response.data["active"]]
        self.assertIn("platform.stats", active_slugs)
        self.assertIn("platform.enabled_modules", active_slugs)
        self.assertIn("platform.recent_activities", active_slugs)
        self.assertEqual(UserDashboardWidget.objects.filter(user=self.member).count(), len(response.data["active"]))

    def test_create_widget_succeeds(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        # First initialize defaults by visiting list
        self.client.force_authenticate(user=self.member)
        self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )
        
        # Now add another widget (we'll enable email_marketing so we can add it)
        from apps.core.module_registry.models import Module, OrganizationModule
        module, _ = Module.objects.get_or_create(slug="email_marketing", defaults={"name": "Email Marketing"})
        OrganizationModule.objects.update_or_create(
            organization=self.organization,
            module=module,
            defaults={"enabled": True}
        )

        response = self.client.post(
            reverse("dashboard-widgets-list"),
            {"widget_type": "email_marketing.create_shortcut"},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["widget_type"], "email_marketing.create_shortcut")

    def test_create_widget_fails_for_inactive_module(self) -> None:
        self.client.force_authenticate(user=self.member)
        # Ensure default widgets are initialized
        self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )

        # email_marketing is NOT enabled by default, so trying to add its widget should fail
        response = self.client.post(
            reverse("dashboard-widgets-list"),
            {"widget_type": "email_marketing.create_shortcut"},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_widget(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        self.client.force_authenticate(user=self.member)
        self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )
        widget = UserDashboardWidget.objects.filter(user=self.member).first()
        self.assertIsNotNone(widget)

        response = self.client.delete(
            reverse("dashboard-widgets-detail", args=[widget.id]),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserDashboardWidget.objects.filter(id=widget.id).exists())

    def test_reorder_widgets(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        self.client.force_authenticate(user=self.member)
        self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )
        
        widgets = list(UserDashboardWidget.objects.filter(user=self.member).order_by("position"))
        self.assertTrue(len(widgets) >= 2)
        
        # Reverse the order
        reversed_ids = [str(w.id) for w in reversed(widgets)]
        
        response = self.client.post(
            reverse("dashboard-widgets-reorder"),
            {"ids": reversed_ids},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify db order is updated
        new_widgets = list(UserDashboardWidget.objects.filter(user=self.member).order_by("position"))
        self.assertEqual([str(w.id) for w in new_widgets], reversed_ids)

    def test_create_multiple_platform_empty_widgets(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        self.client.force_authenticate(user=self.member)
        # Verify we can create one platform.empty widget
        response1 = self.client.post(
            reverse("dashboard-widgets-list"),
            {"widget_type": "platform.empty"},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Verify we can create a second platform.empty widget
        response2 = self.client.post(
            reverse("dashboard-widgets-list"),
            {"widget_type": "platform.empty"},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)

    def test_reorder_widgets_with_configs(self) -> None:
        from apps.core.accounts.models import UserDashboardWidget

        self.client.force_authenticate(user=self.member)
        self.client.get(
            reverse("dashboard-widgets-list"),
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
        )
        
        widgets = list(UserDashboardWidget.objects.filter(user=self.member).order_by("position"))
        self.assertTrue(len(widgets) >= 2)
        
        target_widget = widgets[0]
        reversed_ids = [str(w.id) for w in widgets]
        configs = {
            str(target_widget.id): {"size": "large"}
        }
        
        response = self.client.post(
            reverse("dashboard-widgets-reorder"),
            {"ids": reversed_ids, "configs": configs},
            HTTP_X_ORGANIZATION_SLUG=self.organization.slug,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        target_widget.refresh_from_db()
        self.assertEqual(target_widget.config.get("size"), "large")



