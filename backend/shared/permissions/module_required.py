from functools import wraps

from rest_framework.exceptions import PermissionDenied

from apps.core.module_registry.services import ModuleAccessService
from shared.exceptions import ModuleNotEnabledError


def module_required(module_slug: str):
    """Prüft, ob ein Modul für die aktuelle Organisation aktiv ist."""

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(view, request, *args, **kwargs):
            organization = getattr(request, "organization", None)
            if organization is None:
                raise PermissionDenied("Keine Organisation im Request-Kontext.")

            try:
                ModuleAccessService.ensure_enabled(organization, module_slug)
            except ModuleNotEnabledError as exc:
                raise PermissionDenied(str(exc)) from exc

            return view_func(view, request, *args, **kwargs)

        return wrapper

    return decorator
