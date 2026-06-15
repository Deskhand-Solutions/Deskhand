"""
Zwei Admin-Oberflächen:
- /admin/          → Deskhand-Übersicht (nur das Nötigste)
- /admin/voll/     → Standard-Django-Admin (alle Modelle)
"""

from __future__ import annotations

from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, reverse
from django.utils.translation import gettext_lazy as _


class DeskhandAdminSite(admin.AdminSite):
    site_header = _("Deskhand Verwaltung")
    site_title = _("Deskhand")
    index_title = _("Plattform-Übersicht")
    index_template = "admin/deskhand/index.html"

    def each_context(self, request):
        context = super().each_context(request)
        context["deskhand_admin"] = True
        context["full_admin_index_url"] = reverse("admin:index")
        return context

    def get_urls(self):
        custom_urls = [
            path(
                "sync-modules/",
                self.admin_view(self.sync_modules_view),
                name="sync_modules",
            ),
        ]
        return custom_urls + super().get_urls()

    def sync_modules_view(self, request):
        from django.contrib import messages

        from apps.core.module_registry.platform_catalog import (
            ensure_organization_module_assignments,
            remove_unregistered_modules_from_db,
            sync_all_registered_modules_to_db,
        )
        from apps.core.organizations.models import Organization

        modules = sync_all_registered_modules_to_db()
        removed = remove_unregistered_modules_from_db()
        for organization in Organization.objects.all():
            ensure_organization_module_assignments(organization)

        messages.success(
            request,
            f"{len(modules)} Modul(e) synchronisiert."
            + (f" {removed} Platzhalter entfernt." if removed else ""),
        )
        return redirect("deskhand_admin:index")

    def index(self, request, extra_context=None):
        from django.db.models import Count, Q

        from apps.core.module_registry.models import Module
        from apps.core.organizations.models import Organization

        extra_context = extra_context or {}
        extra_context["organizations"] = (
            Organization.objects.filter(is_active=True)
            .annotate(
                enabled_modules_count=Count(
                    "organization_modules",
                    filter=Q(organization_modules__enabled=True),
                ),
            )
            .order_by("name")
        )
        extra_context["modules"] = Module.objects.filter(is_active=True).order_by(
            "sort_order",
            "name",
        )
        extra_context["sync_modules_url"] = reverse("deskhand_admin:sync_modules")
        return super().index(request, extra_context)


deskhand_admin_site = DeskhandAdminSite(name="deskhand_admin")


def _patch_full_admin_context() -> None:
    original = admin.site.each_context

    def each_context(request):
        context = original(request)
        context["deskhand_admin"] = False
        context["deskhand_admin_index_url"] = reverse("deskhand_admin:index")
        return context

    admin.site.each_context = each_context


def register_deskhand_admin_models() -> None:
    from apps.ai.ai_core.admin import (
        AIProviderCredentialAdmin,
        AIUsageRecordAdmin,
        ModuleAIBindingAdmin,
    )
    from apps.ai.ai_core.models import (
        AIProviderCredential,
        AIUsageRecord,
        ModuleAIBinding,
    )
    from apps.core.accounts.admin import DeskhandUserAdmin, RoleAdmin
    from apps.core.accounts.models import Role, User
    from apps.core.module_registry.admin import DeskhandModuleAdmin
    from apps.core.module_registry.models import Module
    from apps.core.organizations.admin import (
        DeskhandOrganizationAdmin,
        DeskhandOrganizationMemberAdmin,
    )
    from apps.core.organizations.models import Organization, OrganizationMember
    from apps.integrations.admin import IntegrationConnectionAdmin
    from apps.integrations.models import IntegrationConnection

    if Organization in deskhand_admin_site._registry:
        return

    deskhand_admin_site.register(Organization, DeskhandOrganizationAdmin)
    deskhand_admin_site.register(User, DeskhandUserAdmin)
    deskhand_admin_site.register(Role, RoleAdmin)
    deskhand_admin_site.register(Module, DeskhandModuleAdmin)
    deskhand_admin_site.register(OrganizationMember, DeskhandOrganizationMemberAdmin)
    deskhand_admin_site.register(AIProviderCredential, AIProviderCredentialAdmin)
    deskhand_admin_site.register(ModuleAIBinding, ModuleAIBindingAdmin)
    deskhand_admin_site.register(AIUsageRecord, AIUsageRecordAdmin)
    deskhand_admin_site.register(IntegrationConnection, IntegrationConnectionAdmin)

    admin.site.site_header = _("Deskhand – Vollständiger Admin")
    admin.site.site_title = _("Deskhand Voll")
    admin.site.index_title = _("Alle Modelle & Django-System")
    _patch_full_admin_context()
