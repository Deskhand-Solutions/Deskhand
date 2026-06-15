from django.test import TestCase

from apps.core.module_registry.selectors.module_selectors import (
    get_active_catalog_modules,
    get_enabled_organization_module_links,
    organization_has_module_enabled,
)
from shared.test_utils.factories import (
    create_module,
    create_test_organization,
    enable_module_for_org,
)


class ModuleSelectorTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()
        self.module = create_module(slug="email_marketing")

    def test_catalog_includes_active_implemented_module(self) -> None:
        slugs = [module.slug for module in get_active_catalog_modules()]

        self.assertIn("email_marketing", slugs)

    def test_enabled_links_empty_when_not_assigned(self) -> None:
        self.assertEqual(
            list(get_enabled_organization_module_links(self.organization)),
            [],
        )

    def test_enabled_links_returned_when_assigned(self) -> None:
        enable_module_for_org(organization=self.organization, module=self.module)

        links = list(get_enabled_organization_module_links(self.organization))

        self.assertEqual(len(links), 1)
        self.assertEqual(links[0].module.slug, "email_marketing")

    def test_organization_has_module_enabled_reflects_assignment(self) -> None:
        self.assertFalse(
            organization_has_module_enabled(self.organization, "email_marketing"),
        )

        enable_module_for_org(organization=self.organization, module=self.module)

        self.assertTrue(
            organization_has_module_enabled(self.organization, "email_marketing"),
        )
