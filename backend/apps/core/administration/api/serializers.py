from rest_framework import serializers

from apps.core.administration.models import AuditLog, OrganizationAPIKey
from apps.core.accounts.api.serializers import UserSerializer
from apps.core.accounts.models import Role, UserDashboardWidget
from apps.core.module_registry.models import Module, OrganizationModule
from apps.core.organizations.models import Organization, OrganizationMember


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "action",
            "resource_type",
            "resource_id",
            "metadata",
            "ip_address",
            "user_email",
            "created_at",
        ]


class OrganizationAPIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationAPIKey
        fields = [
            "id",
            "name",
            "key_prefix",
            "is_active",
            "last_used_at",
            "expires_at",
            "created_at",
        ]
        read_only_fields = fields


class OrganizationAPIKeyCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "slug", "description", "is_system"]


class OrganizationMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = RoleSerializer(read_only=True)
    role_slug = serializers.SlugField(write_only=True, required=False)

    class Meta:
        model = OrganizationMember
        fields = ["id", "user", "role", "role_slug", "is_active", "created_at"]
        read_only_fields = ["id", "user", "role", "created_at"]


class OrganizationAdminSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "is_active", "member_count", "created_at"]
        read_only_fields = ["id", "created_at"]


class ModuleAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = [
            "id",
            "slug",
            "name",
            "description",
            "icon",
            "version",
            "is_active",
            "sort_order",
        ]


class OrganizationModuleAdminSerializer(serializers.ModelSerializer):
    module = ModuleAdminSerializer(read_only=True)

    class Meta:
        model = OrganizationModule
        fields = ["id", "module", "enabled", "config", "enabled_at"]


class UserDashboardWidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDashboardWidget
        fields = ["id", "widget_type", "position", "config"]
        read_only_fields = ["id"]

