from django.db import models

from shared.mixins import TimestampedModelMixin


class Module(TimestampedModelMixin):
    slug = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True)
    version = models.CharField(max_length=32, default="1.0.0")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name


class OrganizationModule(TimestampedModelMixin):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="organization_modules",
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="organization_modules",
    )
    enabled = models.BooleanField(default=True)
    enabled_at = models.DateTimeField(auto_now_add=True)
    config = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "module"],
                name="unique_organization_module",
            )
        ]
        ordering = ["module__sort_order", "module__name"]

    def __str__(self) -> str:
        state = "aktiv" if self.enabled else "inaktiv"
        return f"{self.organization} / {self.module} ({state})"
