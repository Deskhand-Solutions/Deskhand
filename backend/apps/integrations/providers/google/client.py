import logging
import requests
from apps.integrations.base import BaseIntegrationClient

logger = logging.getLogger(__name__)


class GoogleIntegrationClient(BaseIntegrationClient):
    provider_slug = "google"
    display_name = "Google"

    def __init__(self, *, credentials=None) -> None:
        super().__init__(credentials=credentials)
        self._access_token = self._credentials.access_token

    def _refresh_access_token(self) -> str:
        """Exchange the refresh token for a new access token via Google API."""
        client_id = self._credentials.extra.get("client_id")
        client_secret = self._credentials.extra.get("client_secret")
        refresh_token = self._credentials.extra.get("refresh_token")

        if not refresh_token:
            logger.warning("No Google refresh token available for refreshing.")
            return ""

        url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
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
                f"Google token refresh failed: {response.status_code} - {response.text}"
            )
        except Exception as exc:
            logger.error(f"Google token refresh exception: {exc}")
        return ""

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """
        Execute an authenticated request to Google APIs with automatic token refresh.
        The `path` can be a full URL or relative path (defaulting to googleapis.com).
        """
        url = path if path.startswith("http") else f"https://www.googleapis.com/{path.lstrip('/')}"
        
        headers = kwargs.pop("headers", {})
        if self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"
        else:
            # Try refreshing immediately
            token = self._refresh_access_token()
            if token:
                headers["Authorization"] = f"Bearer {token}"

        response = requests.request(method, url, headers=headers, **kwargs)

        # If unauthorized, try refreshing the token once and retry
        if response.status_code == 401:
            token = self._refresh_access_token()
            if token:
                headers["Authorization"] = f"Bearer {token}"
                response = requests.request(method, url, headers=headers, **kwargs)

        return response

    def health_check(self) -> bool:
        """Verify the Google integration connection works by querying the token info endpoint."""
        if not self._credentials.extra.get("refresh_token"):
            return False

        # Attempt to get a valid access token first
        token = self._access_token or self._refresh_access_token()
        if not token:
            return False

        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?access_token={token}"
            response = requests.get(url, timeout=10)
            return response.status_code == 200
        except Exception:
            return False

    def send_email(self, to_email: str, subject: str, body_text: str) -> bool:
        """Send an email via the Gmail API (users.messages/send)."""
        import base64
        from email.mime.text import MIMEText

        message = MIMEText(body_text)
        message["to"] = to_email
        message["subject"] = subject
        
        # Gmail send payload expects raw base64url encoded RFC 2822 email string
        raw_msg = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        payload = {"raw": raw_msg}

        response = self.request("POST", "gmail/v1/users/me/messages/send", json=payload)
        return response.status_code == 200

    def list_calendar_events(self, calendar_id: str = "primary", max_results: int = 10) -> list:
        """List upcoming events from Google Calendar."""
        path = f"calendar/v3/calendars/{calendar_id}/events?maxResults={max_results}"
        response = self.request("GET", path)
        if response.status_code == 200:
            return response.json().get("items", [])
        return []
