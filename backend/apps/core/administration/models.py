from django.conf import settings
from django.db import models

from shared.mixins import BaseModel


class AuditLog(BaseModel):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="audit_logs",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=120)
    resource_type = models.CharField(max_length=80)
    resource_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self) -> str:
        return f"{self.action} ({self.resource_type})"


class OrganizationAPIKey(BaseModel):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="api_keys",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_api_keys",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    key_prefix = models.CharField(max_length=12)
    key_hash = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
            models.Index(fields=["key_prefix"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.key_prefix}…)"
