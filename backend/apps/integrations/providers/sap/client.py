import logging
import requests
from apps.integrations.base import BaseIntegrationClient

logger = logging.getLogger(__name__)


class SAPIntegrationClient(BaseIntegrationClient):
    provider_slug = "sap"
    display_name = "SAP ERP"

    def __init__(self, *, credentials=None) -> None:
        super().__init__(credentials=credentials)
        self._base_url = self._credentials.extra.get("base_url", "").rstrip("/")
        self._username = self._credentials.extra.get("username")
        self._password = self._credentials.extra.get("password")

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """
        Execute OData REST requests against SAP Gateway.
        Automatically applies Basic Authentication and standard OData headers.
        """
        if not self._base_url:
            raise ValueError("SAP Integration requires a configured base_url.")

        url = path if path.startswith("http") else f"{self._base_url}/{path.lstrip('/')}"
        
        headers = kwargs.pop("headers", {})
        headers.setdefault("Accept", "application/json")
        headers.setdefault("Content-Type", "application/json")
        
        # Apply Basic Auth if credentials exist
        auth = None
        if self._username and self._password:
            auth = (self._username, self._password)

        response = requests.request(method, url, headers=headers, auth=auth, **kwargs)
        return response

    def health_check(self) -> bool:
        """Ping the SAP OData service catalog or metadata to check connectivity."""
        if not self._base_url:
            return False

        try:
            # Check service document metadata
            response = self.request("GET", "$metadata", timeout=10)
            return response.status_code in (200, 201)
        except Exception as exc:
            logger.error(f"SAP health check failed: {exc}")
            return False

    def get_business_partner(self, partner_id: str) -> dict | None:
        """Query a Business Partner (customer/vendor) using SAP OData API_BUSINESS_PARTNER service."""
        path = f"sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('{partner_id}')"
        response = self.request("GET", path)
        if response.status_code == 200:
            return response.json().get("d", {})
        return None

    def get_product_master(self, product_id: str) -> dict | None:
        """Query a product details using SAP OData API_PRODUCT_SRV service."""
        path = f"sap/opu/odata/sap/API_PRODUCT_SRV/A_Product('{product_id}')"
        response = self.request("GET", path)
        if response.status_code == 200:
            return response.json().get("d", {})
        return None
