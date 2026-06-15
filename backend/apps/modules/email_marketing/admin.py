from django.contrib import admin

from apps.modules.email_marketing.models import EmailProject


@admin.register(EmailProject)
class EmailProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "subject_line")
