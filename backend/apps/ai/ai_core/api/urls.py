from django.urls import path

from apps.ai.ai_core.api.views import OrganizationAIOverviewView

urlpatterns = [
    path("overview/", OrganizationAIOverviewView.as_view(), name="ai-overview"),
]
