from django.contrib.auth import get_user_model

from apps.core.organizations.models import OrganizationMember
from apps.core.organizations.selectors.organization_selectors import resolve_organization

User = get_user_model()


def get_user_with_profile(user_id) -> User | None:
    return (
        User.objects.select_related("profile")
        .filter(pk=user_id, is_active=True)
        .first()
    )


def get_organization_users(organization):
    return (
        User.objects.filter(
            organization_memberships__organization=organization,
            organization_memberships__is_active=True,
            is_active=True,
        )
        .select_related("profile")
        .prefetch_related("organization_memberships__role")
        .distinct()
        .order_by("email")
    )


def get_user_role_in_organization(user: User, organization) -> str | None:
    organization = resolve_organization(organization)
    if organization is None:
        return None

    membership = (
        OrganizationMember.objects.select_related("role")
        .filter(organization=organization, user=user, is_active=True)
        .first()
    )
    return membership.role.slug if membership else None
