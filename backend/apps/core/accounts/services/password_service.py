from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from apps.core.administration.services.audit_service import AuditService

User = get_user_model()


class PasswordService:
    @staticmethod
    def create_reset_token(*, email: str) -> dict | None:
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is None:
            return None

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return {"uid": uid, "token": token, "user": user}

    @staticmethod
    def reset_password(*, uid: str, token: str, new_password: str) -> User:
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError) as exc:
            raise ValueError("Ungültiger Reset-Link.") from exc

        if not default_token_generator.check_token(user, token):
            raise ValueError("Ungültiger oder abgelaufener Reset-Token.")

        user.set_password(new_password)
        user.save(update_fields=["password"])
        AuditService.log(
            action="auth.password_reset",
            resource_type="user",
            resource_id=str(user.id),
            user=user,
        )
        return user

    @staticmethod
    def change_password(*, user: User, current_password: str, new_password: str) -> None:
        if not user.check_password(current_password):
            raise ValueError("Aktuelles Passwort ist falsch.")

        user.set_password(new_password)
        user.save(update_fields=["password"])
        AuditService.log(
            action="auth.password_change",
            resource_type="user",
            resource_id=str(user.id),
            user=user,
        )
