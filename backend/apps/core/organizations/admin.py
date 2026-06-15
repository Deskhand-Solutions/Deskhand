from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from apps.ai.ai_core.admin import AIProviderCredentialInline, ModuleAIBindingInline
from apps.ai.ai_core.models import AIProviderCredential
from apps.core.module_registry.admin import (
    OrganizationModuleInline,
    sync_platform_modules_for_organizations,
)
from apps.integrations.admin import IntegrationConnectionInline

from .models import Organization, OrganizationMember, OrganizationSettings


class OrganizationAdminForm(forms.ModelForm):
    class Meta:
        model = Organization
        fields = "__all__"
        help_texts = {
            "name": "Anzeigename der Kunden-Organisation (z. B. Firmenname).",
            "slug": (
                "Technischer Kurzname für URLs (klein, ohne Leerzeichen/Umlaute). "
                "Wird automatisch aus dem Namen erzeugt — im Normalfall unverändert lassen."
            ),
            "is_active": (
                "Deaktivieren sperrt den Zugang für alle Mitglieder, ohne Daten zu löschen."
            ),
        }


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 1
    autocomplete_fields = ("user",)
    fields = ("user", "role", "is_active")
    verbose_name = "Mitglied"
    verbose_name_plural = "Mitglieder (Nutzer dieser Organisation)"


class UserOrganizationMemberInline(admin.TabularInline):
    """Organisationszuordnung beim Bearbeiten eines Nutzerprofils."""

    model = OrganizationMember
    fk_name = "user"
    extra = 1
    autocomplete_fields = ("organization",)
    fields = ("organization", "role", "is_active")
    verbose_name = "Organisationszuordnung"
    verbose_name_plural = "Organisationszuordnungen"


class OrganizationSettingsInline(admin.StackedInline):
    model = OrganizationSettings
    can_delete = False
    extra = 0


class OrganizationAdmin(admin.ModelAdmin):
    form = OrganizationAdminForm
    list_display = ("name", "slug", "is_active", "enabled_module_count", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [OrganizationSettingsInline, OrganizationMemberInline, OrganizationModuleInline]
    actions = [sync_platform_modules_for_organizations]

    @admin.display(description="Freigegebene Module")
    def enabled_module_count(self, obj: Organization) -> int:
        return obj.organization_modules.filter(enabled=True).count()


class DeskhandOrganizationAdmin(OrganizationAdmin):
    change_form_template = "admin/organizations/organization/change_form.html"

    class Media:
        js = ("admin/js/integration_admin.js",)

    # Everything for one organization in one place — no jumping between pages.
    inlines = [
        OrganizationMemberInline,
        OrganizationModuleInline,
        AIProviderCredentialInline,
        ModuleAIBindingInline,
        IntegrationConnectionInline,
        OrganizationSettingsInline,
    ]
    list_display = (
        "name",
        "slug",
        "enabled_module_count",
        "module_freigabe_link",
        "is_active",
    )
    list_display_links = ("name",)

    def has_delete_permission(self, request, obj=None) -> bool:
        # The friendly admin removes the object-level delete button to avoid
        # confusion; members/keys/integrations are removed via their inline
        # "Löschen"-checkbox. Full deletion stays available in /admin/voll/.
        return False

    def save_formset(self, request, form, formset, change) -> None:
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            if (
                isinstance(instance, AIProviderCredential)
                and instance.created_by_id is None
            ):
                instance.created_by = request.user
            instance.save()
        formset.save_m2m()

    @admin.display(description="Modul-Freigabe")
    def module_freigabe_link(self, obj: Organization) -> str:
        url = reverse("deskhand_admin:organizations_organization_change", args=[obj.pk])
        return format_html(
            '<a class="dh-btn dh-btn--primary dh-btn--sm" href="{}?focus=modules">Verwalten</a>',
            url,
        )


@admin.register(Organization)
class DefaultOrganizationAdmin(OrganizationAdmin):
    class Media:
        js = ("admin/js/integration_admin.js",)



@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "role", "is_active")
    list_filter = ("is_active", "role", "organization")
    search_fields = (
        "organization__name",
        "organization__slug",
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    autocomplete_fields = ("organization", "user", "role")
    list_editable = ("is_active",)


class DeskhandOrganizationMemberAdmin(OrganizationMemberAdmin):
    list_editable = ()
