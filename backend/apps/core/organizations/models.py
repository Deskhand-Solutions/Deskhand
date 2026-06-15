from django.conf import settings
from django.db import models

from shared.mixins import TimestampedModelMixin


class Organization(TimestampedModelMixin):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class OrganizationMember(TimestampedModelMixin):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="members",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
    )
    role = models.ForeignKey(
        "accounts.Role",
        on_delete=models.PROTECT,
        related_name="organization_members",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "user"],
                name="unique_organization_member",
            )
        ]
        ordering = ["organization__name", "user__email"]

    def __str__(self) -> str:
        return f"{self.user} @ {self.organization}"


class OrganizationSettings(TimestampedModelMixin):
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name="settings",
    )
    settings = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f"Settings: {self.organization}"
