from unittest.mock import patch, MagicMock
from django.test import TestCase

from apps.integrations.base import IntegrationCredentials
from apps.integrations.providers.shopify.client import ShopifyIntegrationClient


class ShopifyMcpTests(TestCase):
    def setUp(self) -> None:
        self.credentials = IntegrationCredentials(
            access_token="test_token",
            extra={"shop_domain": "test-shop.myshopify.com", "access_token": "test_token"}
        )
        self.client = ShopifyIntegrationClient(credentials=self.credentials)

    def test_get_tools_returns_schema(self) -> None:
        tools = self.client.get_tools()
        self.assertEqual(len(tools), 2)
        tool_names = [t["name"] for t in tools]
        self.assertIn("shopify_get_products", tool_names)
        self.assertIn("shopify_get_orders", tool_names)

        # Check structure
        products_tool = next(t for t in tools if t["name"] == "shopify_get_products")
        self.assertEqual(products_tool["description"], "Retrieve products list from Shopify Admin API.")
        self.assertIn("limit", products_tool["parameters"]["properties"])

    @patch("apps.integrations.providers.shopify.client.ShopifyIntegrationClient.request")
    def test_execute_shopify_get_products(self, mock_request) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"products": [{"id": 1, "title": "Test Product"}]}
        mock_request.return_value = mock_response

        result = self.client.execute_tool("shopify_get_products", {"limit": 5})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "Test Product")
        mock_request.assert_called_once_with("GET", "products.json?limit=5")

    @patch("apps.integrations.providers.shopify.client.ShopifyIntegrationClient.request")
    def test_execute_shopify_get_orders(self, mock_request) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"orders": [{"id": 101, "total_price": "29.99"}]}
        mock_request.return_value = mock_response

        result = self.client.execute_tool("shopify_get_orders", {"limit": 3})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], 101)
        mock_request.assert_called_once_with("GET", "orders.json?limit=3&status=any")

    def test_execute_unknown_tool_raises(self) -> None:
        with self.assertRaises(NotImplementedError):
            self.client.execute_tool("unknown_tool_name", {})
