from django.urls import path

from .views import (
    ModuleCatalogListView,
    ModulePluginRegistryView,
    OrganizationModuleListView,
)

urlpatterns = [
    path("", ModuleCatalogListView.as_view(), name="module-catalog"),
    path("plugins/", ModulePluginRegistryView.as_view(), name="module-plugins"),
    path(
        "organizations/<slug:organization_slug>/",
        OrganizationModuleListView.as_view(),
        name="organization-modules",
    ),
]
