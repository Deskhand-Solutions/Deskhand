from django.test import TestCase

from apps.core.accounts.services.auth_service import AuthService
from shared.test_utils.factories import create_test_user


class AuthServiceTests(TestCase):
    def setUp(self) -> None:
        self.password = "TestPass123!"
        self.user = create_test_user(password=self.password)

    def test_login_returns_tokens_for_valid_credentials(self) -> None:
        result = AuthService.login(
            email=self.user.email,
            password=self.password,
        )

        self.assertIn("access", result)
        self.assertIn("refresh", result)
        self.assertEqual(result["user_id"], str(self.user.id))

    def test_login_normalizes_email(self) -> None:
        result = AuthService.login(
            email=f"  {self.user.email.upper()}  ",
            password=self.password,
        )

        self.assertIn("access", result)

    def test_login_raises_for_invalid_password(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            AuthService.login(email=self.user.email, password="wrong-password")

        self.assertIn("Ungültige Anmeldedaten", str(ctx.exception))

    def test_refresh_returns_new_access_token(self) -> None:
        login = AuthService.login(email=self.user.email, password=self.password)
        refreshed = AuthService.refresh(refresh_token=login["refresh"])

        self.assertIn("access", refreshed)
