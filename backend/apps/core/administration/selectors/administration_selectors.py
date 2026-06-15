"""Organization-scoped read queries for administration views and services."""

from django.db.models import Count, Sum

from apps.ai.ai_core.models import AIUsageRecord
from apps.core.accounts.models import Role
from apps.core.administration.models import AuditLog, OrganizationAPIKey
from apps.core.module_registry.models import Module, OrganizationModule
from apps.core.organizations.models import Organization, OrganizationMember


def get_organization_members(organization):
    return (
        OrganizationMember.objects.filter(organization=organization)
        .select_related("user", "role", "user__profile")
        .order_by("user__email")
    )


def get_organization_admin_modules(organization):
    return (
        OrganizationModule.objects.filter(organization=organization)
        .select_related("module")
        .order_by("module__sort_order", "module__name")
    )


def get_organization_api_keys(organization):
    return OrganizationAPIKey.objects.filter(
        organization=organization,
    ).order_by("-created_at")


def get_organization_api_key(organization, pk):
    return OrganizationAPIKey.objects.filter(
        organization=organization,
        pk=pk,
    ).first()


def get_organization_audit_logs(organization):
    return AuditLog.objects.filter(
        organization=organization,
    ).select_related("user")


def get_recent_audit_logs(organization, limit: int = 10):
    return list(
        AuditLog.objects.filter(organization=organization)
        .select_related("user")
        .order_by("-created_at")[:limit]
        .values(
            "id",
            "action",
            "resource_type",
            "resource_id",
            "metadata",
            "created_at",
            "user__email",
        )
    )


def count_active_members(organization) -> int:
    return OrganizationMember.objects.filter(
        organization=organization,
        is_active=True,
    ).count()


def count_enabled_modules(organization) -> int:
    return OrganizationModule.objects.filter(
        organization=organization,
        enabled=True,
    ).count()


def aggregate_ai_usage(organization) -> dict:
    return AIUsageRecord.objects.filter(organization=organization).aggregate(
        tokens_input=Sum("tokens_input"),
        tokens_output=Sum("tokens_output"),
        total_requests=Count("id"),
    )


def list_roles():
    return Role.objects.all().order_by("name")


def list_platform_organizations():
    return Organization.objects.annotate(
        member_count=Count("members"),
    ).order_by("name")


def list_platform_modules():
    return Module.objects.order_by("sort_order", "name")
