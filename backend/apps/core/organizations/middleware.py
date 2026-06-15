from django.utils.functional import SimpleLazyObject

from apps.core.organizations.models import Organization
from apps.core.organizations.selectors.organization_selectors import (
    get_user_organization_membership,
)


def _resolve_organization(request):
    slug = (
        request.headers.get("X-Organization-Slug")
        or request.META.get("HTTP_X_ORGANIZATION_SLUG")
        or request.GET.get("organization")
    )

    if not slug:
        return None

    organization = Organization.objects.filter(slug=slug, is_active=True).first()
    if organization is None:
        return None

    if request.user.is_authenticated and not request.user.is_superuser:
        membership = get_user_organization_membership(request.user, organization)
        if membership is None:
            return None

    return organization


class OrganizationContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.organization = SimpleLazyObject(lambda: _resolve_organization(request))
        return self.get_response(request)
