from django.contrib.auth import get_user_model

from apps.core.accounts.constants import RoleSlug
from apps.core.accounts.models import Role
from apps.core.accounts.services.registration_service import RegistrationService
from apps.core.module_registry.models import Module, OrganizationModule
from apps.core.organizations.models import Organization, OrganizationMember

User = get_user_model()


def create_test_organization(
    *,
    name: str = "Test Organisation",
    slug: str = "test-org",
) -> Organization:
    return Organization.objects.create(name=name, slug=slug, is_active=True)


def create_test_user(
    *,
    email: str = "user@test.example",
    password: str = "TestPass123!",
) -> User:
    RegistrationService.ensure_system_roles()
    return User.objects.create_user(
        email=email,
        password=password,
        email_verified=True,
    )


def create_org_member(
    *,
    user: User,
    organization: Organization,
    role_slug: str = RoleSlug.USER,
) -> OrganizationMember:
    RegistrationService.ensure_system_roles()
    role = Role.objects.get(slug=role_slug)
    return OrganizationMember.objects.create(
        organization=organization,
        user=user,
        role=role,
        is_active=True,
    )


def create_module(
    *,
    slug: str = "email_marketing",
    name: str = "E-Mail Marketing",
    is_active: bool = True,
) -> Module:
    module, _ = Module.objects.get_or_create(
        slug=slug,
        defaults={
            "name": name,
            "is_active": is_active,
        },
    )
    if module.is_active != is_active:
        module.is_active = is_active
        module.save(update_fields=["is_active"])
    return module


def enable_module_for_org(
    *,
    organization: Organization,
    module: Module,
    enabled: bool = True,
) -> OrganizationModule:
    org_module, _ = OrganizationModule.objects.update_or_create(
        organization=organization,
        module=module,
        defaults={"enabled": enabled},
    )
    return org_module
