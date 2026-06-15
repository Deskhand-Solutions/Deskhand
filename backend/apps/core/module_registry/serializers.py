from rest_framework import serializers

from .models import Module, OrganizationModule


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = (
            "id",
            "slug",
            "name",
            "description",
            "icon",
            "version",
            "is_active",
            "sort_order",
        )


class OrganizationModuleSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(read_only=True)

    class Meta:
        model = OrganizationModule
        fields = (
            "id",
            "module",
            "enabled",
            "enabled_at",
            "config",
        )
