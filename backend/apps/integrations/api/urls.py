from django.urls import path

from apps.integrations.api.views import (
    IntegrationCatalogListView,
    OrganizationIntegrationListView,
)

urlpatterns = [
    path("", IntegrationCatalogListView.as_view(), name="integration-catalog"),
    path(
        "organizations/<slug:organization_slug>/",
        OrganizationIntegrationListView.as_view(),
        name="organization-integrations",
    ),
]
