from django.test import TestCase

from apps.core.module_registry.services import ModuleAccessService
from shared.exceptions import ModuleNotEnabledError
from shared.test_utils.factories import (
    create_module,
    create_test_organization,
    enable_module_for_org,
)


class ModuleAccessServiceTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.module = create_module(slug="email_marketing")

    def test_is_enabled_false_when_not_assigned(self) -> None:
        self.assertFalse(
            ModuleAccessService.is_enabled(self.organization, "email_marketing"),
        )

    def test_is_enabled_true_when_assigned_and_active(self) -> None:
        enable_module_for_org(organization=self.organization, module=self.module)

        self.assertTrue(
            ModuleAccessService.is_enabled(self.organization, "email_marketing"),
        )

    def test_ensure_enabled_raises_when_disabled(self) -> None:
        with self.assertRaises(ModuleNotEnabledError):
            ModuleAccessService.ensure_enabled(self.organization, "email_marketing")

    def test_get_enabled_modules_returns_only_enabled_modules(self) -> None:
        enable_module_for_org(organization=self.organization, module=self.module)

        enabled = list(ModuleAccessService.get_enabled_modules(self.organization))

        self.assertEqual(len(enabled), 1)
        self.assertEqual(enabled[0].slug, "email_marketing")
