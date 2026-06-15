from rest_framework import serializers


class AIProviderOverviewSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    requires_api_key = serializers.BooleanField()
    configured = serializers.BooleanField()
    is_active = serializers.BooleanField()
    masked_key = serializers.CharField(allow_blank=True)
    label = serializers.CharField(allow_blank=True)
    default_model = serializers.CharField(allow_blank=True)
    available_models = serializers.ListField(child=serializers.CharField())


class ModuleBindingOverviewSerializer(serializers.Serializer):
    module_slug = serializers.CharField()
    provider = serializers.CharField()
    provider_name = serializers.CharField()
    model = serializers.CharField(allow_blank=True)
