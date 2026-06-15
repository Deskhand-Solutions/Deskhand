from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase

from apps.core.organizations.middleware import _resolve_organization
from shared.test_utils.factories import (
    create_org_member,
    create_test_organization,
    create_test_user,
)


class OrganizationMiddlewareTests(TestCase):
    def setUp(self) -> None:
        self.factory = RequestFactory()
        self.organization = create_test_organization()
        self.member = create_test_user(email="member@test.example")
        self.outsider = create_test_user(email="outsider@test.example")
        create_org_member(user=self.member, organization=self.organization)

    def _request(self, *, user, slug: str | None = None):
        request = self.factory.get("/")
        request.user = user
        if slug:
            request.META["HTTP_X_ORGANIZATION_SLUG"] = slug
        return request

    def test_returns_none_without_header(self) -> None:
        request = self._request(user=self.member)
        self.assertIsNone(_resolve_organization(request))

    def test_returns_organization_for_member(self) -> None:
        request = self._request(user=self.member, slug=self.organization.slug)
        organization = _resolve_organization(request)

        self.assertIsNotNone(organization)
        self.assertEqual(organization.slug, self.organization.slug)

    def test_returns_none_for_non_member(self) -> None:
        request = self._request(user=self.outsider, slug=self.organization.slug)
        self.assertIsNone(_resolve_organization(request))

    def test_returns_organization_for_anonymous_user_with_valid_slug(self) -> None:
        """Membership is enforced only for authenticated non-superusers."""
        request = self._request(user=AnonymousUser(), slug=self.organization.slug)
        organization = _resolve_organization(request)

        self.assertIsNotNone(organization)
        self.assertEqual(organization.slug, self.organization.slug)
