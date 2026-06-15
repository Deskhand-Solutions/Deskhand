from django.contrib.auth import get_user_model
from django.utils.functional import SimpleLazyObject, empty

from apps.core.organizations.models import Organization, OrganizationMember

User = get_user_model()


def resolve_organization(organization) -> Organization | None:
    """Unwrap request.organization (SimpleLazyObject) to Organization or None."""
    if organization is None:
        return None
    if isinstance(organization, SimpleLazyObject):
        if organization._wrapped is empty:
            organization._setup()
        return organization._wrapped
    return organization


def get_user_organizations(user: User):
    if user.is_superuser:
        return Organization.objects.filter(is_active=True).order_by("name")

    return (
        Organization.objects.filter(
            members__user=user,
            members__is_active=True,
            is_active=True,
        )
        .distinct()
        .order_by("name")
    )


def get_user_organization_membership(
    user: User,
    organization: Organization,
) -> OrganizationMember | None:
    return (
        OrganizationMember.objects.select_related("role")
        .filter(
            organization=organization,
            user=user,
            is_active=True,
        )
        .first()
    )


def get_organization_by_slug(slug: str) -> Organization | None:
    return Organization.objects.filter(slug=slug, is_active=True).first()
