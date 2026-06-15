from django.conf import settings
from django.db import models

from shared.mixins import BaseModel, TimestampedModelMixin


class AIProvider(models.TextChoices):
    OPENAI = "openai", "OpenAI"
    ANTHROPIC = "anthropic", "Anthropic"
    GOOGLE = "google", "Google"
    LOCAL = "local", "Lokal"


class AIUsageRecord(TimestampedModelMixin):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="ai_usage_records",
    )
    module_slug = models.SlugField(max_length=120)
    provider = models.CharField(max_length=30, choices=AIProvider.choices)
    model = models.CharField(max_length=120)
    tokens_input = models.PositiveIntegerField(default=0)
    tokens_output = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.organization} / {self.module_slug} ({self.model})"


class AIProviderCredential(BaseModel):
    """
    Per-organization API key for an AI provider (OpenAI/Anthropic/Google).

    The raw key is encrypted at rest in ``api_key_encrypted`` (via the shared
    secrets cipher); ``key_prefix`` + ``key_last4`` allow masked display without
    decrypting. One credential per (organization, provider).
    """

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="ai_provider_credentials",
    )
    provider = models.CharField(max_length=30, choices=AIProvider.choices)
    label = models.CharField(max_length=120, blank=True)
    api_key_encrypted = models.TextField(blank=True)
    key_prefix = models.CharField(max_length=12, blank=True)
    key_last4 = models.CharField(max_length=8, blank=True)
    base_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_ai_credentials",
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["provider"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "provider"],
                name="uniq_org_ai_provider",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.organization_id}:{self.provider}"

    @property
    def masked_key(self) -> str:
        if not self.key_prefix and not self.key_last4:
            return ""
        return f"{self.key_prefix}••••{self.key_last4}"


class ModuleAIBinding(BaseModel):
    """
    Routing: which AI provider/model a module uses for an organization.

    Answers "welches Modul nutzt welche KI". One binding per
    (organization, module_slug); ``provider`` resolves to the org's
    ``AIProviderCredential`` of that provider.
    """

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="module_ai_bindings",
    )
    module_slug = models.SlugField(max_length=120)
    provider = models.CharField(max_length=30, choices=AIProvider.choices)
    model = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["module_slug"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "module_slug"],
                name="uniq_org_module_ai_binding",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.organization_id}:{self.module_slug}->{self.provider}"
