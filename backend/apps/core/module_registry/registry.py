"""
Zentrale Registrierung für KI-Automatisierungsmodule.

Jedes Modul unter apps/modules/<modulname>/ registriert sich hier,
sobald es implementiert wird.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ModuleDefinition:
    slug: str
    name: str
    description: str = ""
    icon: str = ""
    api_prefix: str = ""
    frontend_route: str = ""
    sort_order: int = 0
    metadata: dict = field(default_factory=dict)


REGISTERED_MODULES: dict[str, ModuleDefinition] = {}


def register_module(definition: ModuleDefinition) -> None:
    REGISTERED_MODULES[definition.slug] = definition


def get_registered_modules() -> list[ModuleDefinition]:
    return sorted(REGISTERED_MODULES.values(), key=lambda item: item.sort_order)


def get_implemented_module_slugs() -> frozenset[str]:
    """Slugs of modules with real backend/frontend implementation."""
    return frozenset(REGISTERED_MODULES.keys())
