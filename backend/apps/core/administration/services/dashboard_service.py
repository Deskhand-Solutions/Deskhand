from apps.core.administration.selectors import administration_selectors as selectors
from apps.core.organizations.models import Organization
from apps.core.accounts.models import UserDashboardWidget


class DashboardService:
    AVAILABLE_WIDGETS = {
        "platform.empty": {
            "widget_type": "platform.empty",
            "name": "Freier Widget-Slot",
            "description": "Ein nicht belegter Platzhalter auf dem Dashboard.",
            "icon": "Plus",
            "module_slug": None,
        },
        "platform.stats": {
            "widget_type": "platform.stats",
            "name": "Statistik-Karten",
            "description": "Zeigt grundlegende Plattform-Kennzahlen wie aktive Module, Mitglieder und KI-Verbrauch.",
            "icon": "Activity",
            "module_slug": None,
        },
        "platform.enabled_modules": {
            "widget_type": "platform.enabled_modules",
            "name": "Freigeschaltete Module",
            "description": "Auflistung aller für Ihr Unternehmen aktiven Module mit Direktlinks.",
            "icon": "Package",
            "module_slug": None,
        },
        "platform.recent_activities": {
            "widget_type": "platform.recent_activities",
            "name": "Letzte Aktivitäten",
            "description": "Protokoll der letzten Aktionen und System-Aktivitäten im Unternehmen.",
            "icon": "History",
            "module_slug": None,
        },
        "email_marketing.recent_projects": {
            "widget_type": "email_marketing.recent_projects",
            "name": "E-Mail-Marketing: Projekte",
            "description": "Die neuesten E-Mail-Marketing-Entwürfe und deren Status auf einen Blick.",
            "icon": "Mail",
            "module_slug": "email_marketing",
        },
        "email_marketing.create_shortcut": {
            "widget_type": "email_marketing.create_shortcut",
            "name": "E-Mail-Marketing: Schnellstart",
            "description": "Erstellen Sie mit einem Klick ein neues E-Mail-Marketing-Projekt.",
            "icon": "PlusCircle",
            "module_slug": "email_marketing",
        },
    }

    DEFAULT_WIDGETS = [
        "platform.stats",
        "platform.enabled_modules",
        "platform.recent_activities",
        "email_marketing.recent_projects",
    ]

    @staticmethod
    def get_organization_dashboard(organization: Organization) -> dict:
        usage_stats = selectors.aggregate_ai_usage(organization)
        total_tokens = (usage_stats["tokens_input"] or 0) + (
            usage_stats["tokens_output"] or 0
        )

        return {
            "organization": {
                "id": organization.id,
                "name": organization.name,
                "slug": organization.slug,
            },
            "modules": {
                "enabled_count": selectors.count_enabled_modules(organization),
            },
            "members": {
                "count": selectors.count_active_members(organization),
            },
            "usage": {
                "total_tokens": total_tokens,
                "total_requests": usage_stats["total_requests"] or 0,
            },
            "recent_activities": selectors.get_recent_audit_logs(organization),
        }

    @staticmethod
    def get_enabled_module_slugs(organization: Organization) -> set[str]:
        from apps.core.module_registry.models import OrganizationModule
        return set(
            OrganizationModule.objects.filter(
                organization=organization, enabled=True
            ).values_list("module__slug", flat=True)
        )

    @staticmethod
    def get_available_widgets(organization: Organization) -> list[dict]:
        enabled_slugs = DashboardService.get_enabled_module_slugs(organization)
        widgets = []
        for slug, w in DashboardService.AVAILABLE_WIDGETS.items():
            if slug == "platform.empty":
                continue
            if w["module_slug"] is None or w["module_slug"] in enabled_slugs:
                widgets.append(w)
        return widgets

    @staticmethod
    def get_user_dashboard_widgets(user, organization: Organization) -> list[UserDashboardWidget]:
        widgets = UserDashboardWidget.objects.filter(
            user=user, organization=organization
        ).order_by("position", "created_at")

        enabled_slugs = DashboardService.get_enabled_module_slugs(organization)

        if not widgets.exists():
            default_active = []
            for pos, w_type in enumerate(DashboardService.DEFAULT_WIDGETS):
                w_def = DashboardService.AVAILABLE_WIDGETS.get(w_type)
                if w_def and (w_def["module_slug"] is None or w_def["module_slug"] in enabled_slugs):
                    default_active.append(
                        UserDashboardWidget(
                            user=user,
                            organization=organization,
                            widget_type=w_type,
                            position=pos,
                        )
                    )
            if default_active:
                UserDashboardWidget.objects.bulk_create(default_active)
                widgets = UserDashboardWidget.objects.filter(
                    user=user, organization=organization
                ).order_by("position", "created_at")
        else:
            invalid_widgets = []
            valid_widgets = []
            for w in widgets:
                w_def = DashboardService.AVAILABLE_WIDGETS.get(w.widget_type)
                if w_def and (w_def["module_slug"] is None or w_def["module_slug"] in enabled_slugs):
                    valid_widgets.append(w)
                else:
                    invalid_widgets.append(w)
            if invalid_widgets:
                UserDashboardWidget.objects.filter(id__in=[w.id for w in invalid_widgets]).delete()
                widgets = UserDashboardWidget.objects.filter(
                    user=user, organization=organization
                ).order_by("position", "created_at")
            else:
                widgets = list(widgets)

        return widgets
