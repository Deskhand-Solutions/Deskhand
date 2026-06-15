from django.urls import path

from apps.modules.email_marketing.api.views import (
    EmailProjectDetailView,
    EmailProjectGenerateView,
    EmailProjectListCreateView,
)

urlpatterns = [
    path("projects/", EmailProjectListCreateView.as_view(), name="email-project-list"),
    path(
        "projects/<uuid:project_id>/",
        EmailProjectDetailView.as_view(),
        name="email-project-detail",
    ),
    path(
        "projects/<uuid:project_id>/generate/",
        EmailProjectGenerateView.as_view(),
        name="email-project-generate",
    ),
]
