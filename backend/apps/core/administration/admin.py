from django.contrib import admin

from apps.core.administration.models import AuditLog, OrganizationAPIKey


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "resource_type", "organization", "user", "created_at"]
    list_filter = ["action", "resource_type"]
    search_fields = ["action", "resource_type", "user__email"]


@admin.register(OrganizationAPIKey)
class OrganizationAPIKeyAdmin(admin.ModelAdmin):
    list_display = ["name", "key_prefix", "organization", "is_active", "last_used_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "key_prefix", "organization__name"]
