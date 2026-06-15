import logging
import requests
from apps.integrations.base import BaseIntegrationClient

logger = logging.getLogger(__name__)


class ShopifyIntegrationClient(BaseIntegrationClient):
    provider_slug = "shopify"
    display_name = "Shopify"

    def __init__(self, *, credentials=None) -> None:
        super().__init__(credentials=credentials)
        self._shop_domain = self._credentials.extra.get("shop_domain", "").strip()
        self._access_token = self._credentials.extra.get("access_token")

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """
        Execute an authenticated request to the Shopify Admin REST API.
        Autocompletes shop domain and attaches the custom X-Shopify-Access-Token header.
        """
        if not self._shop_domain:
            raise ValueError("Shopify Integration requires a configured shop_domain.")

        # Ensure shop domain has myshopify.com
        domain = self._shop_domain
        if not domain.startswith("http"):
            domain = f"https://{domain}"

        url = path if path.startswith("http") else f"{domain}/admin/api/2024-01/{path.lstrip('/')}"

        headers = kwargs.pop("headers", {})
        headers.setdefault("Accept", "application/json")
        headers.setdefault("Content-Type", "application/json")
        if self._access_token:
            headers["X-Shopify-Access-Token"] = self._access_token

        response = requests.request(method, url, headers=headers, **kwargs)
        return response

    def health_check(self) -> bool:
        """Verify the connection by querying shop details from Shopify Admin API."""
        if not self._shop_domain or not self._access_token:
            return False

        try:
            response = self.request("GET", "shop.json", timeout=10)
            return response.status_code == 200
        except Exception as exc:
            logger.error(f"Shopify health check failed: {exc}")
            return False

    def get_products(self, limit: int = 20) -> list:
        """Retrieve products list from Shopify Admin API."""
        response = self.request("GET", f"products.json?limit={limit}")
        if response.status_code == 200:
            return response.json().get("products", [])
        return []

    def get_orders(self, limit: int = 10) -> list:
        """Retrieve recent orders from Shopify Admin API."""
        response = self.request("GET", f"orders.json?limit={limit}&status=any")
        if response.status_code == 200:
            return response.json().get("orders", [])
        return []
