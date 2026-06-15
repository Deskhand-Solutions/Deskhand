from django.contrib import admin
from django.urls import include, path

from config.admin_sites import deskhand_admin_site

urlpatterns = [
    path("admin/", deskhand_admin_site.urls),
    path("admin/voll/", admin.site.urls),
    path("api/", include("apps.core.administration.urls")),
    path("api/v1/auth/", include("apps.core.accounts.api.urls")),
    path("api/v1/", include("apps.core.administration.api.urls")),
    path("api/v1/organizations/", include("apps.core.organizations.urls")),
    path("api/v1/modules/", include("apps.core.module_registry.urls")),
    path("api/v1/ai/", include("apps.ai.ai_core.api.urls")),
    path("api/v1/integrations/", include("apps.integrations.api.urls")),
    path(
        "api/v1/modules/email_marketing/",
        include("apps.modules.email_marketing.api.urls"),
    ),
]
