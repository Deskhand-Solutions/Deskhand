from apps.core.accounts.models import Role
from apps.core.organizations.models import OrganizationMember
from shared.exceptions import DomainValidationError


class MembershipService:
    """Write-path orchestration for organization memberships."""

    @staticmethod
    def update_membership(
        *,
        member: OrganizationMember,
        role_slug: str | None = None,
        is_active: bool | None = None,
    ) -> OrganizationMember:
        if role_slug:
            role = Role.objects.filter(slug=role_slug).first()
            if role is None:
                raise DomainValidationError("Rolle nicht gefunden.")
            member.role = role
        if is_active is not None:
            member.is_active = bool(is_active)
        member.save()
        return member
