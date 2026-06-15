from dataclasses import dataclass

from apps.integrations.models import IntegrationConnectionStatus
from apps.integrations.registry import get_registered_integrations
from apps.integrations.selectors.integration_selectors import (
    list_connections_for_organization,
)


@dataclass(frozen=True)
class OrganizationIntegrationStatus:
    slug: str
    name: str
    description: str
    status: str
    connected: bool
    auth_type: str
    required_scopes: list[str]
    credential_fields: list
    masked_credential: str


def get_organization_integration_statuses(
    *,
    organization_id: int,
) -> list[OrganizationIntegrationStatus]:
    connections = {
        connection.provider_slug: connection
        for connection in list_connections_for_organization(
            organization_id=organization_id,
        )
    }

    items: list[OrganizationIntegrationStatus] = []
    for definition in get_registered_integrations():
        connection = connections.get(definition.slug)
        status = (
            connection.status
            if connection is not None
            else IntegrationConnectionStatus.DISCONNECTED
        )
        masked = (
            connection.metadata.get("masked", "")
            if connection is not None and isinstance(connection.metadata, dict)
            else ""
        )
        items.append(
            OrganizationIntegrationStatus(
                slug=definition.slug,
                name=definition.name,
                description=definition.description,
                status=status,
                connected=status == IntegrationConnectionStatus.CONNECTED,
                auth_type=definition.auth_type,
                required_scopes=list(definition.required_scopes),
                credential_fields=definition.credential_fields,
                masked_credential=masked,
            )
        )
    return items
