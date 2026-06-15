from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("platform/", views.platform_info, name="platform-info"),
]
