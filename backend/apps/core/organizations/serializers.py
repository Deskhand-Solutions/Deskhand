from rest_framework import serializers

from .models import Organization, OrganizationMember


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "is_active", "created_at")


class OrganizationMemberSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ("id", "username", "role_name", "is_active")
