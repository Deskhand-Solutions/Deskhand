from django.db import models

from shared.mixins import BaseModel


class IntegrationConnectionStatus(models.TextChoices):
    CONNECTED = "connected", "Connected"
    DISCONNECTED = "disconnected", "Disconnected"
    ERROR = "error", "Error"


class IntegrationConnection(BaseModel):
    """Per-organization link to an external provider (Google, Shopify, …)."""

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="integration_connections",
    )
    provider_slug = models.CharField(max_length=64)
    status = models.CharField(
        max_length=32,
        choices=IntegrationConnectionStatus.choices,
        default=IntegrationConnectionStatus.DISCONNECTED,
    )
    # Store encrypted tokens via a secrets backend in production; never log this field.
    credentials_encrypted = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["provider_slug"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "provider_slug"],
                name="uniq_org_integration_provider",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.organization_id}:{self.provider_slug}"
