from django.db.models import QuerySet

from apps.integrations.models import IntegrationConnection


def get_connection_for_organization(
    *,
    organization_id: int,
    provider_slug: str,
) -> IntegrationConnection | None:
    return IntegrationConnection.objects.filter(
        organization_id=organization_id,
        provider_slug=provider_slug,
    ).first()


def list_connections_for_organization(
    *,
    organization_id: int,
) -> QuerySet[IntegrationConnection]:
    return IntegrationConnection.objects.filter(
        organization_id=organization_id,
    ).order_by("provider_slug")
