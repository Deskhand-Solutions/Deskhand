from django.urls import path

from apps.core.accounts.api.views import (
    CsrfView,
    EmailVerifyView,
    LoginView,
    LogoutView,
    MeView,
    PasswordChangeView,
    PasswordForgotView,
    PasswordResetView,
    RegisterView,
    TokenRefreshView,
)

urlpatterns = [
    path("csrf/", CsrfView.as_view(), name="auth-csrf"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("password/forgot/", PasswordForgotView.as_view(), name="auth-password-forgot"),
    path("password/reset/", PasswordResetView.as_view(), name="auth-password-reset"),
    path("password/change/", PasswordChangeView.as_view(), name="auth-password-change"),
    path("email/verify/", EmailVerifyView.as_view(), name="auth-email-verify"),
    path("me/", MeView.as_view(), name="auth-me"),
]
