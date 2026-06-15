from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.core.accounts.models import UserProfile
from apps.core.accounts.selectors.user_selectors import get_user_role_in_organization

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=10, write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    organization_name = serializers.CharField(max_length=255, required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


class PasswordForgotSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=10, write_only=True)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=10, write_only=True)


class EmailVerifySerializer(serializers.Serializer):
    token = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "avatar_url",
            "phone",
            "job_title",
            "notification_preferences",
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "email_verified",
            "is_superuser",
            "profile",
            "role",
        ]
        read_only_fields = fields

    def get_role(self, obj: User) -> str | None:
        organization = self.context.get("organization")
        if organization is None:
            return None
        return get_user_role_in_organization(obj, organization)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "avatar_url",
            "phone",
            "job_title",
            "notification_preferences",
        ]
