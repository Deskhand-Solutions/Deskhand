from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.core.administration.api.views import (
    AuditLogViewSet,
    DashboardView,
    MyOrganizationsView,
    OrganizationAPIKeyViewSet,
    OrganizationMemberViewSet,
    OrganizationModuleAdminViewSet,
    PlatformAdminViewSet,
    RoleViewSet,
    UserDashboardWidgetViewSet,
)

router = DefaultRouter()
router.register("api-keys", OrganizationAPIKeyViewSet, basename="api-keys")
router.register("audit-logs", AuditLogViewSet, basename="audit-logs")
router.register("members", OrganizationMemberViewSet, basename="members")
router.register("organization-modules", OrganizationModuleAdminViewSet, basename="organization-modules")
router.register("roles", RoleViewSet, basename="roles")
router.register("dashboard/widgets", UserDashboardWidgetViewSet, basename="dashboard-widgets")


urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("organizations/mine/", MyOrganizationsView.as_view(), name="my-organizations"),
    path(
        "platform/organizations/",
        PlatformAdminViewSet.as_view({"get": "list_organizations"}),
        name="platform-organizations",
    ),
    path(
        "platform/modules/",
        PlatformAdminViewSet.as_view({"get": "list_modules"}),
        name="platform-modules",
    ),
    *router.urls,
]
