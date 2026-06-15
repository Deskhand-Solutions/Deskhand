from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.module_registry.selectors.module_selectors import (
    get_active_catalog_modules,
    get_enabled_organization_module_links,
)
from shared.permissions import IsOrganizationMember

from .registry import get_registered_modules
from .serializers import ModuleSerializer, OrganizationModuleSerializer


class ModuleCatalogListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ModuleSerializer

    def get_queryset(self):
        return get_active_catalog_modules()


class OrganizationModuleListView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get(self, request, organization_slug: str):
        organization = getattr(request, "organization", None)
        if organization is None or organization.slug != organization_slug:
            return Response(
                {"detail": "Organisation nicht gefunden."},
                status=404,
            )

        organization_modules = get_enabled_organization_module_links(organization)
        serializer = OrganizationModuleSerializer(organization_modules, many=True)
        return Response(serializer.data)


class ModulePluginRegistryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            [
                {
                    "slug": module.slug,
                    "name": module.name,
                    "description": module.description,
                    "icon": module.icon,
                    "api_prefix": module.api_prefix,
                    "frontend_route": module.frontend_route,
                    "sort_order": module.sort_order,
                }
                for module in get_registered_modules()
            ]
        )
