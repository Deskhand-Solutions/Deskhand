from django.contrib.auth import get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.accounts.api.serializers import (
    EmailVerifySerializer,
    LoginSerializer,
    LogoutSerializer,
    PasswordChangeSerializer,
    PasswordForgotSerializer,
    PasswordResetSerializer,
    RefreshSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from apps.core.accounts.services.auth_service import AuthService
from apps.core.accounts.services.cookie_service import AuthCookieService
from apps.core.accounts.services.password_service import PasswordService
from apps.core.accounts.services.registration_service import RegistrationService
from apps.core.accounts.selectors.user_selectors import get_user_with_profile

User = get_user_model()


def _client_ip(request) -> str | None:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _user_response(request, user, *, status_code: int) -> Response:
    user_data = UserSerializer(
        user,
        context={
            "request": request,
            "organization": getattr(request, "organization", None),
        },
    ).data
    return Response({"user": user_data}, status=status_code)


def _auth_response(request, tokens: dict, user) -> Response:
    response = _user_response(request, user, status_code=status.HTTP_200_OK)
    return AuthCookieService.set_auth_cookies(response, tokens)


class CsrfView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"detail": "ok"})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = RegistrationService.register_user(
                email=data["email"],
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                organization_name=data.get("organization_name") or None,
                ip_address=_client_ip(request),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        tokens = AuthService.login(
            email=data["email"],
            password=data["password"],
            ip_address=_client_ip(request),
        )
        response = _user_response(request, user, status_code=status.HTTP_201_CREATED)
        return AuthCookieService.set_auth_cookies(response, tokens)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            tokens = AuthService.login(
                email=data["email"],
                password=data["password"],
                ip_address=_client_ip(request),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_user_with_profile(tokens["user_id"])
        return _auth_response(request, tokens, user)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = (
            serializer.validated_data.get("refresh")
            or AuthCookieService.get_refresh_token(request)
        )
        if refresh_token:
            AuthService.logout(
                refresh_token=refresh_token,
                user=request.user,
                ip_address=_client_ip(request),
            )

        response = Response(status=status.HTTP_204_NO_CONTENT)
        return AuthCookieService.clear_auth_cookies(response)


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = (
            serializer.validated_data.get("refresh")
            or AuthCookieService.get_refresh_token(request)
        )
        if not refresh_token:
            return Response(
                {"detail": "Refresh-Token fehlt."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            tokens = AuthService.refresh(refresh_token=refresh_token)
        except Exception:
            response = Response(
                {"detail": "Ungültiger oder abgelaufener Refresh-Token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return AuthCookieService.clear_auth_cookies(response)

        response = Response({"detail": "Token aktualisiert."})
        return AuthCookieService.set_auth_cookies(response, tokens)


class PasswordForgotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordForgotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = PasswordService.create_reset_token(email=serializer.validated_data["email"])
        if result is not None:
            return Response(
                {
                    "detail": "Reset-Link erstellt.",
                    "uid": result["uid"],
                    "token": result["token"],
                }
            )
        return Response({"detail": "Falls die E-Mail existiert, wurde ein Reset-Link gesendet."})


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            PasswordService.reset_password(
                uid=data["uid"],
                token=data["token"],
                new_password=data["new_password"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Passwort erfolgreich zurückgesetzt."})


class EmailVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RegistrationService.verify_email(token=serializer.validated_data["token"])
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "E-Mail erfolgreich verifiziert."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_user_with_profile(request.user.id)
        serializer = UserSerializer(
            user,
            context={
                "request": request,
                "organization": getattr(request, "organization", None),
            },
        )
        return Response(serializer.data)

    def patch(self, request):
        user = get_user_with_profile(request.user.id)
        user_serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        profile_data = request.data.get("profile", request.data)
        profile_serializer = UserProfileUpdateSerializer(
            user.profile,
            data=profile_data,
            partial=True,
        )
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()

        return Response(
            UserSerializer(
                user,
                context={
                    "request": request,
                    "organization": getattr(request, "organization", None),
                },
            ).data
        )


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            PasswordService.change_password(
                user=request.user,
                current_password=data["current_password"],
                new_password=data["new_password"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Passwort geändert."})
