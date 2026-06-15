import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from apps.core.accounts.constants import RoleSlug, SYSTEM_ROLES
from apps.core.accounts.models import EmailVerificationToken, Role, UserProfile
from apps.core.administration.services.audit_service import AuditService
from apps.core.organizations.models import Organization, OrganizationMember
from shared.utils.text import slugify_value

User = get_user_model()


class RegistrationService:
    @staticmethod
    def _create_unique_organization_slug(name: str) -> str:
        base = slugify_value(name)[:80] or "organization"
        slug = base
        counter = 1
        while Organization.objects.filter(slug=slug).exists():
            suffix = f"-{counter}"
            slug = f"{base[: 80 - len(suffix)]}{suffix}"
            counter += 1
        return slug

    @staticmethod
    def ensure_system_roles() -> None:
        for role_data in SYSTEM_ROLES:
            Role.objects.get_or_create(
                slug=role_data["slug"],
                defaults={
                    "name": role_data["name"],
                    "description": role_data["description"],
                    "is_system": True,
                },
            )

    @staticmethod
    @transaction.atomic
    def register_user(
        *,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        organization_name: str | None = None,
        ip_address: str | None = None,
    ) -> User:
        RegistrationService.ensure_system_roles()

        if User.objects.filter(email__iexact=email).exists():
            raise ValueError("Diese E-Mail ist bereits registriert.")

        user = User.objects.create_user(
            email=email.lower(),
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        UserProfile.objects.create(user=user)

        if organization_name:
            organization = Organization.objects.create(
                name=organization_name,
                slug=RegistrationService._create_unique_organization_slug(organization_name),
            )
            org_admin_role = Role.objects.get(slug=RoleSlug.ORG_ADMIN)
            OrganizationMember.objects.create(
                organization=organization,
                user=user,
                role=org_admin_role,
            )

        RegistrationService._create_email_verification_token(user)
        AuditService.log(
            action="auth.register",
            resource_type="user",
            resource_id=str(user.id),
            user=user,
            ip_address=ip_address,
        )
        return user

    @staticmethod
    def _create_email_verification_token(user: User) -> EmailVerificationToken:
        token = secrets.token_urlsafe(48)
        return EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=48),
        )

    @staticmethod
    def verify_email(*, token: str) -> User:
        verification = (
            EmailVerificationToken.objects.select_related("user")
            .filter(token=token, used_at__isnull=True)
            .first()
        )
        if verification is None:
            raise ValueError("Ungültiger Verifikationstoken.")

        if verification.expires_at < timezone.now():
            raise ValueError("Verifikationstoken abgelaufen.")

        user = verification.user
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        verification.used_at = timezone.now()
        verification.save(update_fields=["used_at"])
        return user
