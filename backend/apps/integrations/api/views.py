from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.integrations.api.serializers import (
    IntegrationCatalogSerializer,
    OrganizationIntegrationSerializer,
)
from apps.integrations.registry import get_registered_integrations
from apps.integrations.services.catalog_service import (
    get_organization_integration_statuses,
)
from shared.permissions import IsOrganizationMember


class IntegrationCatalogListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = [
            {
                "slug": item.slug,
                "name": item.name,
                "description": item.description,
                "auth_type": item.auth_type,
                "required_scopes": list(item.required_scopes),
                "credential_fields": [
                    {
                        "key": f.key,
                        "label": f.label,
                        "secret": f.secret,
                        "help_text": f.help_text,
                    }
                    for f in item.credential_fields
                ],
            }
            for item in get_registered_integrations()
        ]
        serializer = IntegrationCatalogSerializer(payload, many=True)
        return Response(serializer.data)


class OrganizationIntegrationListView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get(self, request, organization_slug: str):
        organization = getattr(request, "organization", None)
        if organization is None or organization.slug != organization_slug:
            return Response({"detail": "Organisation nicht gefunden."}, status=404)

        payload = [
            {
                "slug": item.slug,
                "name": item.name,
                "description": item.description,
                "status": item.status,
                "connected": item.connected,
                "auth_type": item.auth_type,
                "required_scopes": item.required_scopes,
                "credential_fields": [
                    {
                        "key": f.key,
                        "label": f.label,
                        "secret": f.secret,
                        "help_text": f.help_text,
                    }
                    for f in item.credential_fields
                ],
                "masked_credential": item.masked_credential,
            }
            for item in get_organization_integration_statuses(
                organization_id=organization.id,
            )
        ]
        serializer = OrganizationIntegrationSerializer(payload, many=True)
        return Response(serializer.data)

    def post(self, request, organization_slug: str):
        organization = getattr(request, "organization", None)
        if organization is None or organization.slug != organization_slug:
            return Response({"detail": "Organisation nicht gefunden."}, status=404)

        provider_slug = request.data.get("provider_slug")
        credentials = request.data.get("credentials")
        disconnect = request.data.get("disconnect", False)

        if not provider_slug:
            return Response({"detail": "provider_slug ist erforderlich."}, status=400)

        from apps.integrations.registry import get_integration

        try:
            get_integration(provider_slug)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)

        if disconnect:
            from apps.integrations.models import IntegrationConnection
            IntegrationConnection.objects.filter(
                organization=organization, provider_slug=provider_slug
            ).delete()
        else:
            if not isinstance(credentials, dict):
                return Response({"detail": "credentials (dict) ist erforderlich."}, status=400)

            from apps.integrations.services.connection_service import (
                get_client_for_organization,
                set_connection_credentials,
            )

            try:
                # 1. Save and encrypt credentials
                connection = set_connection_credentials(
                    organization=organization,
                    provider_slug=provider_slug,
                    credentials=credentials,
                    user=request.user,
                )

                # 2. Dynamic client verification (health check)
                client = get_client_for_organization(
                    organization_id=organization.id,
                    provider_slug=provider_slug,
                    require_connected=False,
                )
                if client.health_check():
                    connection.status = "connected"
                else:
                    connection.status = "error"
                connection.save()
            except Exception as exc:
                return Response({"detail": f"Verbindung fehlgeschlagen: {str(exc)}"}, status=400)

        # Return current status list
        payload = [
            {
                "slug": item.slug,
                "name": item.name,
                "description": item.description,
                "status": item.status,
                "connected": item.connected,
                "auth_type": item.auth_type,
                "required_scopes": item.required_scopes,
                "credential_fields": [
                    {
                        "key": f.key,
                        "label": f.label,
                        "secret": f.secret,
                        "help_text": f.help_text,
                    }
                    for f in item.credential_fields
                ],
                "masked_credential": item.masked_credential,
            }
            for item in get_organization_integration_statuses(
                organization_id=organization.id,
            )
        ]
        serializer = OrganizationIntegrationSerializer(payload, many=True)
        return Response(serializer.data)

