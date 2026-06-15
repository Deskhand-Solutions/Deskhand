from django.contrib import admin

from apps.core.module_registry.platform_catalog import ensure_organization_module_assignments

from .models import Module, OrganizationModule


class ModuleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order", "enabled_organization_count")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active",)

    @admin.display(description="Freigeschaltete Organisationen")
    def enabled_organization_count(self, obj: Module) -> int:
        return obj.organization_modules.filter(enabled=True).count()


class DeskhandModuleAdmin(ModuleAdmin):
    list_display = ("name", "slug", "is_active", "sort_order", "enabled_organization_count")
    readonly_fields = ("slug", "name", "description", "icon", "version", "sort_order")
    list_editable = ()
    prepopulated_fields = {}

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Module)
class DefaultModuleAdmin(ModuleAdmin):
    pass


@admin.register(OrganizationModule)
class OrganizationModuleAdmin(admin.ModelAdmin):
    list_display = ("organization", "module", "enabled", "enabled_at", "updated_at")
    list_filter = ("enabled", "module", "organization")
    list_editable = ("enabled",)
    search_fields = (
        "organization__name",
        "organization__slug",
        "module__name",
        "module__slug",
    )
    autocomplete_fields = ("organization", "module")
    ordering = ("organization__name", "module__sort_order")


class OrganizationModuleInline(admin.TabularInline):
    model = OrganizationModule
    extra = 0
    fields = ("module", "enabled", "enabled_at")
    readonly_fields = ("enabled_at",)
    autocomplete_fields = ("module",)
    ordering = ("module__sort_order", "module__name")
    verbose_name = "Modul-Freigabe"
    verbose_name_plural = "Modul-Freigaben"


@admin.action(description="Plattform-Module zuweisen (fehlende ergänzen)")
def sync_platform_modules_for_organizations(modeladmin, request, queryset):
    for organization in queryset:
        ensure_organization_module_assignments(organization)
