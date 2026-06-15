import logging
import requests
from apps.integrations.base import BaseIntegrationClient

logger = logging.getLogger(__name__)


class MicrosoftIntegrationClient(BaseIntegrationClient):
    provider_slug = "microsoft"
    display_name = "Microsoft"

    def __init__(self, *, credentials=None) -> None:
        super().__init__(credentials=credentials)
        self._access_token = self._credentials.access_token

    def _refresh_access_token(self) -> str:
        """Exchange the Microsoft refresh token for a new access token via Graph endpoint."""
        client_id = self._credentials.extra.get("client_id")
        client_secret = self._credentials.extra.get("client_secret")
        tenant_id = self._credentials.extra.get("tenant_id") or "common"
        refresh_token = self._credentials.extra.get("refresh_token")

        if not refresh_token:
            logger.warning("No Microsoft refresh token available.")
            return ""

        url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": "https://graph.microsoft.com/.default",
        }

        try:
            response = requests.post(url, data=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                new_token = data.get("access_token")
                if new_token:
                    self._access_token = new_token
                    return new_token
            logger.error(
                f"Microsoft token refresh failed: {response.status_code} - {response.text}"
            )
        except Exception as exc:
            logger.error(f"Microsoft token refresh exception: {exc}")
        return ""

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """
        Execute an authenticated request to Microsoft Graph APIs with automatic token refresh.
        The `path` can be a full URL or relative path (defaulting to Microsoft Graph v1.0).
        """
        url = path if path.startswith("http") else f"https://graph.microsoft.com/v1.0/{path.lstrip('/')}"
        
        headers = kwargs.pop("headers", {})
        if self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"
        else:
            token = self._refresh_access_token()
            if token:
                headers["Authorization"] = f"Bearer {token}"

        response = requests.request(method, url, headers=headers, **kwargs)

        if response.status_code == 401:
            token = self._refresh_access_token()
            if token:
                headers["Authorization"] = f"Bearer {token}"
                response = requests.request(method, url, headers=headers, **kwargs)

        return response

    def health_check(self) -> bool:
        """Verify the connection by fetching the user profile from Microsoft Graph."""
        if not self._credentials.extra.get("refresh_token"):
            return False

        token = self._access_token or self._refresh_access_token()
        if not token:
            return False

        try:
            response = self.request("GET", "me")
            return response.status_code == 200
        except Exception:
            return False

    def send_outlook_email(self, to_email: str, subject: str, body_text: str) -> bool:
        """Send an email using Microsoft Outlook Mail API (me/sendMail)."""
        payload = {
            "message": {
                "subject": subject,
                "body": {"contentType": "Text", "content": body_text},
                "toRecipients": [{"emailAddress": {"address": to_email}}],
            },
            "saveToSentItems": "true",
        }
        response = self.request("POST", "me/sendMail", json=payload)
        return response.status_code == 202

    def list_calendar_events(self, max_results: int = 10) -> list:
        """List upcoming events from Microsoft Calendar."""
        path = f"me/events?$top={max_results}"
        response = self.request("GET", path)
        if response.status_code == 200:
            return response.json().get("value", [])
        return []
