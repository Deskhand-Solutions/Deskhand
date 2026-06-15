from django.contrib.auth.models import AbstractUser, Permission
from django.db import models

from apps.core.accounts.managers import UserManager
from shared.mixins import BaseModel, TimestampedModelMixin, UUIDModelMixin


class User(UUIDModelMixin, AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email


class Role(TimestampedModelMixin):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="deskhand_roles",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserProfile(BaseModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar_url = models.URLField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    job_title = models.CharField(max_length=120, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f"Profil: {self.user.email}"


class EmailVerificationToken(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )
    token = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"E-Mail-Verifikation: {self.user.email}"


class UserDashboardWidget(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="dashboard_widgets",
    )
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="user_dashboard_widgets",
    )
    widget_type = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)
    config = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["position", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "organization", "widget_type"],
                condition=~models.Q(widget_type="platform.empty"),
                name="unique_user_org_widget",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user} / {self.widget_type} in {self.organization}"

