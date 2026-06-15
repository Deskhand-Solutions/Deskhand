from rest_framework.permissions import BasePermission

from apps.core.accounts.constants import RoleSlug
from apps.core.organizations.models import OrganizationMember
from apps.core.organizations.selectors.organization_selectors import (
    get_user_organization_membership,
)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsOrganizationAdmin(BasePermission):
    def has_permission(self, request, view):
        organization = getattr(request, "organization", None)
        if organization is None or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        membership = get_user_organization_membership(request.user, organization)
        return membership is not None and membership.role.slug in {
            RoleSlug.ORG_ADMIN,
            RoleSlug.SUPER_ADMIN,
        }


class IsOrganizationManager(BasePermission):
    def has_permission(self, request, view):
        organization = getattr(request, "organization", None)
        if organization is None or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        membership = get_user_organization_membership(request.user, organization)
        return membership is not None and membership.role.slug in {
            RoleSlug.ORG_ADMIN,
            RoleSlug.SUPER_ADMIN,
            RoleSlug.MANAGER,
        }


class IsOrganizationMember(BasePermission):
    def has_permission(self, request, view):
        organization = getattr(request, "organization", None)
        if organization is None or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        return OrganizationMember.objects.filter(
            organization=organization,
            user=request.user,
            is_active=True,
        ).exists()
