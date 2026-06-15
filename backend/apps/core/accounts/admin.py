from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.core.accounts.models import EmailVerificationToken, Role, User, UserProfile
from apps.core.organizations.admin import UserOrganizationMemberInline


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0
    max_num = 1
    fields = ("job_title", "phone", "avatar_url")
    verbose_name = "Profil"
    verbose_name_plural = "Profil"


class UserAdmin(DjangoUserAdmin):
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "is_staff", "email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Persönlich", {"fields": ("first_name", "last_name", "email_verified")}),
        (
            "Berechtigungen",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Zeiten", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "first_name", "last_name"),
            },
        ),
    )
    filter_horizontal = ("groups", "user_permissions")


class DeskhandUserAdmin(DjangoUserAdmin):
    inlines = [UserProfileInline, UserOrganizationMemberInline]
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "is_staff", "is_active", "email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Persönlich", {"fields": ("first_name", "last_name", "email_verified")}),
        ("Zugang", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Zeiten", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "first_name", "last_name"),
            },
        ),
    )
    filter_horizontal = ()


@admin.register(User)
class DefaultUserAdmin(UserAdmin):
    pass


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_system"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "job_title", "phone"]
    search_fields = ["user__email"]


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ["user", "expires_at", "used_at", "created_at"]
    search_fields = ["user__email", "token"]
