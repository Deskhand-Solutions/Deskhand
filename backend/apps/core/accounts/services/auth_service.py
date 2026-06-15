from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.administration.services.audit_service import AuditService

User = get_user_model()


class AuthService:
    @staticmethod
    def login(*, email: str, password: str, ip_address: str | None = None) -> dict:
        normalized_email = email.strip().lower()
        user = authenticate(username=normalized_email, password=password)
        if user is None or not user.is_active:
            raise ValueError("Ungültige Anmeldedaten.")

        refresh = RefreshToken.for_user(user)
        AuditService.log(
            action="auth.login",
            resource_type="user",
            resource_id=str(user.id),
            user=user,
            ip_address=ip_address,
        )
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": str(user.id),
        }

    @staticmethod
    def logout(*, refresh_token: str, user: User, ip_address: str | None = None) -> None:
        token = RefreshToken(refresh_token)
        token.blacklist()
        AuditService.log(
            action="auth.logout",
            resource_type="user",
            resource_id=str(user.id),
            user=user,
            ip_address=ip_address,
        )

    @staticmethod
    def refresh(*, refresh_token: str) -> dict:
        token = RefreshToken(refresh_token)
        data = {"access": str(token.access_token)}

        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                token.blacklist()
            token.set_jti()
            token.set_exp()
            token.set_iat()
            data["refresh"] = str(token)

        return data
