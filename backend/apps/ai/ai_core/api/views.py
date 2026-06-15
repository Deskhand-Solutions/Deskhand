from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.ai_core.api.serializers import (
    AIProviderOverviewSerializer,
    ModuleBindingOverviewSerializer,
)
from apps.ai.ai_core.services.overview import get_organization_ai_overview
from shared.permissions import IsOrganizationMember


class OrganizationAIOverviewView(APIView):
    """Read-only AI config for the active organization (all members may view)."""

    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get(self, request):
        overview = get_organization_ai_overview(
            organization_id=request.organization.id,
        )
        return Response(
            {
                "providers": AIProviderOverviewSerializer(
                    overview["providers"], many=True
                ).data,
                "module_bindings": ModuleBindingOverviewSerializer(
                    overview["module_bindings"], many=True
                ).data,
            }
        )
