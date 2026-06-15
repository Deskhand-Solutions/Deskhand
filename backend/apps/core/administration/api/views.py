from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.administration.api.serializers import (
    AuditLogSerializer,
    ModuleAdminSerializer,
    OrganizationAdminSerializer,
    OrganizationAPIKeyCreateSerializer,
    OrganizationAPIKeySerializer,
    OrganizationMemberSerializer,
    OrganizationModuleAdminSerializer,
    RoleSerializer,
    UserDashboardWidgetSerializer,
)
from apps.core.administration.selectors import administration_selectors as selectors
from apps.core.administration.services.api_key_service import APIKeyService
from apps.core.administration.services.dashboard_service import DashboardService
from apps.core.administration.services.membership_service import MembershipService
from apps.core.administration.services.organization_module_service import (
    OrganizationModuleAdminService,
)
from apps.core.organizations.selectors.organization_selectors import (
    get_user_organizations,
)
from apps.core.accounts.models import UserDashboardWidget
from shared.exceptions import DomainValidationError
from shared.permissions import IsOrganizationAdmin, IsOrganizationMember, IsSuperAdmin



class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get(self, request):
        data = DashboardService.get_organization_dashboard(request.organization)
        return Response(data)


class OrganizationAPIKeyViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def list(self, request):
        keys = selectors.get_organization_api_keys(request.organization)
        return Response(OrganizationAPIKeySerializer(keys, many=True).data)

    def create(self, request):
        serializer = OrganizationAPIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        api_key, raw_key = APIKeyService.create_key(
            organization=request.organization,
            name=serializer.validated_data["name"],
            created_by=request.user,
        )
        return Response(
            {
                "api_key": OrganizationAPIKeySerializer(api_key).data,
                "secret": raw_key,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        api_key = selectors.get_organization_api_key(request.organization, pk)
        if api_key is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        APIKeyService.revoke_key(api_key=api_key, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        return selectors.get_organization_audit_logs(self.request.organization)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]
    serializer_class = RoleSerializer

    def get_queryset(self):
        return selectors.list_roles()


class OrganizationMemberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        return selectors.get_organization_members(self.request.organization)

    def partial_update(self, request, pk=None):
        member = self.get_object()
        try:
            member = MembershipService.update_membership(
                member=member,
                role_slug=request.data.get("role_slug"),
                is_active=(
                    request.data["is_active"]
                    if "is_active" in request.data
                    else None
                ),
            )
        except DomainValidationError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(OrganizationMemberSerializer(member).data)


class OrganizationModuleAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]
    serializer_class = OrganizationModuleAdminSerializer

    def get_queryset(self):
        return selectors.get_organization_admin_modules(self.request.organization)

    def partial_update(self, request, pk=None):
        org_module = self.get_object()
        org_module = OrganizationModuleAdminService.update_assignment(
            org_module=org_module,
            enabled=(
                request.data["enabled"] if "enabled" in request.data else None
            ),
            config=(
                request.data["config"] if "config" in request.data else None
            ),
        )
        return Response(OrganizationModuleAdminSerializer(org_module).data)


class PlatformAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def list_organizations(self, request):
        organizations = selectors.list_platform_organizations()
        return Response(OrganizationAdminSerializer(organizations, many=True).data)

    def list_modules(self, request):
        modules = selectors.list_platform_modules()
        return Response(ModuleAdminSerializer(modules, many=True).data)


class MyOrganizationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organizations = get_user_organizations(request.user)
        return Response(
            [
                {"id": org.id, "name": org.name, "slug": org.slug}
                for org in organizations
            ]
        )


class UserDashboardWidgetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    serializer_class = UserDashboardWidgetSerializer
    queryset = UserDashboardWidget.objects.all()

    def get_queryset(self):
        return UserDashboardWidget.objects.filter(
            user=self.request.user,
            organization=self.request.organization
        ).order_by("position", "created_at")

    def list(self, request):
        active_widgets = DashboardService.get_user_dashboard_widgets(
            user=request.user, organization=request.organization
        )
        available_widgets = DashboardService.get_available_widgets(request.organization)
        
        return Response({
            "active": UserDashboardWidgetSerializer(active_widgets, many=True).data,
            "available": available_widgets,
        })

    def perform_create(self, serializer):
        widget_type = serializer.validated_data["widget_type"]
        enabled_slugs = DashboardService.get_enabled_module_slugs(self.request.organization)
        w_def = DashboardService.AVAILABLE_WIDGETS.get(widget_type)
        
        if not w_def:
            raise ValidationError("Ungültiger Widget-Typ.")
        if w_def["module_slug"] and w_def["module_slug"] not in enabled_slugs:
            raise ValidationError("Dieses Modul ist für Ihr Unternehmen nicht aktiv.")
            
        if widget_type != "platform.empty" and UserDashboardWidget.objects.filter(
            user=self.request.user,
            organization=self.request.organization,
            widget_type=widget_type
        ).exists():
            raise ValidationError("Dieses Widget befindet sich bereits auf Ihrem Dashboard.")

        from django.db import models
        position = serializer.validated_data.get("position")
        if position is not None:
            UserDashboardWidget.objects.filter(
                user=self.request.user,
                organization=self.request.organization,
                position__gte=position
            ).update(position=models.F("position") + 1)
        else:
            max_pos = UserDashboardWidget.objects.filter(
                user=self.request.user,
                organization=self.request.organization
            ).aggregate(models.Max("position"))["position__max"]
            position = (max_pos + 1) if max_pos is not None else 0
        
        serializer.save(
            user=self.request.user,
            organization=self.request.organization,
            position=position
        )

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        ids = request.data.get("ids", [])
        configs = request.data.get("configs", {})
        if not ids:
            return Response({"detail": "Keine IDs angegeben."}, status=status.HTTP_400_BAD_REQUEST)
        
        widgets = self.get_queryset().filter(id__in=ids)
        if len(widgets) != len(ids):
            return Response({"detail": "Ungültige Widgets in der Liste."}, status=status.HTTP_400_BAD_REQUEST)
            
        widget_map = {str(w.id): w for w in widgets}
        for pos, w_id in enumerate(ids):
            widget = widget_map.get(str(w_id))
            if widget:
                widget.position = pos
                update_fields = ["position"]
                if str(w_id) in configs:
                    widget.config = {**widget.config, **configs[str(w_id)]}
                    update_fields.append("config")
                widget.save(update_fields=update_fields)
                
        return Response(self.serializer_class(widgets, many=True).data)

