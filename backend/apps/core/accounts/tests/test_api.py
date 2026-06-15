from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from shared.test_utils.factories import create_test_user


class AccountsApiTests(APITestCase):
    def setUp(self) -> None:
        self.password = "TestPass123!"
        self.user = create_test_user(password=self.password)

    def test_csrf_endpoint_is_public(self) -> None:
        response = self.client.get(reverse("auth-csrf"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "ok")

    def test_login_returns_user_payload(self) -> None:
        response = self.client.post(
            reverse("auth-login"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_login_rejects_invalid_credentials(self) -> None:
        response = self.client.post(
            reverse("auth-login"),
            {"email": self.user.email, "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self) -> None:
        response = self.client.get(reverse("auth-me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_profile_for_authenticated_user(self) -> None:
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("auth-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertIn("profile", response.data)
