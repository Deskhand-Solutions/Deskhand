import json

from apps.integrations.base import BaseIntegrationClient, IntegrationCredentials
from apps.integrations.exceptions import IntegrationNotConnectedError
from apps.integrations.models import IntegrationConnection, IntegrationConnectionStatus
from apps.integrations.registry import IntegrationDefinition, get_integration
from apps.integrations.selectors import get_connection_for_organization
from shared.security import get_secrets_cipher, mask_secret

# Credential keys treated as the "primary" secret when none is declared.
_COMMON_SECRET_KEYS = ("access_token", "api_key", "token", "bot_token", "api_token")


def get_client_for_organization(
    *,
    organization_id: int,
    provider_slug: str,
    require_connected: bool = True,
) -> BaseIntegrationClient:
    """
    Factory used by all modules to access a shared integration client.

    Example (inside a module service):
        client = get_client_for_organization(
            organization_id=org.id,
            provider_slug="google",
        )
    """
    definition = get_integration(provider_slug)
    connection = get_connection_for_organization(
        organization_id=organization_id,
        provider_slug=provider_slug,
    )

    if require_connected:
        if connection is None or connection.status != IntegrationConnectionStatus.CONNECTED:
            raise IntegrationNotConnectedError(
                f"Organization {organization_id} is not connected to '{provider_slug}'"
            )

    credentials = IntegrationCredentials()
    if connection and connection.credentials_encrypted:
        credentials = _decode_credentials(definition, connection.credentials_encrypted)

    client_class = definition.client_class
    assert client_class is not None
    return client_class(credentials=credentials)


def set_connection_credentials(
    *,
    organization,
    provider_slug: str,
    credentials: dict,
    status: str = IntegrationConnectionStatus.CONNECTED,
    user=None,
) -> IntegrationConnection:
    """Encrypt and store an organization's credentials for a provider."""
    from apps.core.administration.services.audit_service import AuditService

    definition = get_integration(provider_slug)  # validates the slug
    encrypted, metadata = encode_credentials(definition, credentials)

    connection, _ = IntegrationConnection.objects.update_or_create(
        organization=organization,
        provider_slug=provider_slug,
        defaults={
            "credentials_encrypted": encrypted,
            "status": status,
            "metadata": metadata,
        },
    )
    AuditService.log(
        action="integration.set_credentials",
        resource_type="integration_connection",
        resource_id=str(connection.id),
        user=user,
        organization=organization,
        metadata={"provider": provider_slug},
    )
    return connection


def encode_credentials(
    definition: IntegrationDefinition,
    credentials: dict,
) -> tuple[str, dict]:
    """Encrypt credentials + build the masked display metadata. Reused by admin."""
    cipher = get_secrets_cipher()
    cleaned = {key: value for key, value in credentials.items() if value not in (None, "")}
    encrypted = cipher.encrypt(json.dumps(cleaned)) if cleaned else ""
    metadata = {
        "masked": mask_secret(_primary_secret(definition, cleaned)),
        "fields": sorted(cleaned.keys()),
    }
    return encrypted, metadata


def _decode_credentials(
    definition: IntegrationDefinition,
    raw_encrypted: str,
) -> IntegrationCredentials:
    decrypted = get_secrets_cipher().decrypt(raw_encrypted)
    try:
        data = json.loads(decrypted)
    except (ValueError, json.JSONDecodeError):
        # Legacy: a bare token string written before structured storage existed.
        return IntegrationCredentials(access_token=decrypted)

    if not isinstance(data, dict):
        return IntegrationCredentials(access_token=decrypted)

    return IntegrationCredentials(
        access_token=_primary_secret(definition, data),
        refresh_token=data.get("refresh_token", ""),
        extra=data,
    )


def _primary_secret(definition: IntegrationDefinition, data: dict) -> str:
    for credential_field in definition.credential_fields:
        if credential_field.secret and data.get(credential_field.key):
            return str(data[credential_field.key])
    for key in _COMMON_SECRET_KEYS:
        if data.get(key):
            return str(data[key])
    return ""
