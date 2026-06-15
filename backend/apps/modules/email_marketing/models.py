from django.conf import settings
from django.db import models

from shared.mixins import BaseModel


class EmailProjectStatus(models.TextChoices):
    DRAFT = "draft", "Entwurf"
    GENERATED = "generated", "Generiert"


class EmailProject(BaseModel):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="email_projects",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="email_projects",
    )
    title = models.CharField(max_length=255)
    subject_line = models.CharField(max_length=998, blank=True)
    context = models.TextField(
        blank=True,
        help_text="Product, offer, audience, and key message for the email.",
    )
    style_guidelines = models.TextField(
        blank=True,
        help_text="Brand colors, tone, layout preferences.",
    )
    html_content = models.TextField(blank=True)
    image_assets = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {id, alt_text, data_url} image references.",
    )
    status = models.CharField(
        max_length=20,
        choices=EmailProjectStatus.choices,
        default=EmailProjectStatus.DRAFT,
    )

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "title"],
                name="email_marketing_unique_project_title_per_org",
            ),
        ]

    def __str__(self) -> str:
        return self.title
