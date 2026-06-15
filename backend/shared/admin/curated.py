"""Kuratierte Admin-Ansicht — nur Wesentliches im Standardmodus."""

from __future__ import annotations

SESSION_KEY = "deskhand_admin_full"

# app_label → model_name (Kleinbuchstaben)
ESSENTIAL_MODELS: frozenset[tuple[str, str]] = frozenset(
    {
        ("organizations", "organization"),
        ("organizations", "organizationmember"),
        ("module_registry", "organizationmodule"),
        ("module_registry", "module"),
        ("accounts", "user"),
        ("accounts", "role"),
        ("subscriptions", "subscription"),
    }
)


def is_full_admin(request) -> bool:
    return bool(request.session.get(SESSION_KEY, False))


def set_admin_mode(request, *, full: bool) -> None:
    request.session[SESSION_KEY] = full
    request.session.modified = True


def model_is_essential(app_label: str, model_name: str) -> bool:
    return (app_label, model_name.lower()) in ESSENTIAL_MODELS


def filter_app_list(app_list: list[dict]) -> list[dict]:
    """Reduziert die Django-App-Liste auf kuratierte Modelle."""
    filtered: list[dict] = []
    for app in app_list:
        models = [
            model
            for model in app.get("models", [])
            if model_is_essential(app["app_label"], model["object_name"])
        ]
        if models:
            filtered.append({**app, "models": models})
    return filtered
