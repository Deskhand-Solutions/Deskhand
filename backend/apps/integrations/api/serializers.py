from rest_framework import serializers


class CredentialFieldSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    secret = serializers.BooleanField()
    help_text = serializers.CharField(allow_blank=True)


class IntegrationCatalogSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    auth_type = serializers.CharField()
    required_scopes = serializers.ListField(child=serializers.CharField())
    credential_fields = CredentialFieldSerializer(many=True)


class OrganizationIntegrationSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    connected = serializers.BooleanField()
    auth_type = serializers.CharField()
    required_scopes = serializers.ListField(child=serializers.CharField())
    credential_fields = CredentialFieldSerializer(many=True)
    masked_credential = serializers.CharField(allow_blank=True)

