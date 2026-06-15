"""
Central registry for reusable third-party integrations.

Each provider lives under `apps/integrations/providers/<slug>/` and registers
itself here. Modules import clients through `services/connection_service`, never
by instantiating provider classes directly.
"""

from dataclasses import dataclass, field
from typing import Type

from apps.integrations.base import BaseIntegrationClient


@dataclass(frozen=True)
class CredentialField:
    """Describes one credential input a provider needs (drives admin + UI labels)."""

    key: str
    label: str
    secret: bool = True
    help_text: str = ""


@dataclass(frozen=True)
class IntegrationDefinition:
    slug: str
    name: str
    description: str = ""
    client_class: Type[BaseIntegrationClient] | None = None
    auth_type: str = "credentials"  # "credentials" or "oauth"
    required_scopes: list[str] = field(default_factory=list)
    credential_fields: list[CredentialField] = field(default_factory=list)
    sort_order: int = 0
    metadata: dict = field(default_factory=dict)


REGISTERED_INTEGRATIONS: dict[str, IntegrationDefinition] = {}


def register_integration(definition: IntegrationDefinition) -> None:
    if definition.client_class is None:
        raise ValueError(f"Integration '{definition.slug}' requires client_class")
    REGISTERED_INTEGRATIONS[definition.slug] = definition


def get_integration(slug: str) -> IntegrationDefinition:
    try:
        return REGISTERED_INTEGRATIONS[slug]
    except KeyError as exc:
        from apps.integrations.exceptions import IntegrationNotRegisteredError

        raise IntegrationNotRegisteredError(f"Unknown integration: {slug}") from exc


def get_registered_integrations() -> list[IntegrationDefinition]:
    return sorted(REGISTERED_INTEGRATIONS.values(), key=lambda item: item.sort_order)
