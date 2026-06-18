import json
from unittest.mock import patch, MagicMock
from django.test import TestCase

from apps.ai.ai_core.models import AIUsageRecord
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse
from apps.ai.ai_core.services.llm_router import LLMRouter
from apps.integrations.services.connection_service import set_connection_credentials
from shared.test_utils.factories import create_test_organization


class McpAgentLoopTests(TestCase):
    def setUp(self) -> None:
        self.organization = create_test_organization()

        # Set up a connected Shopify integration
        set_connection_credentials(
            organization=self.organization,
            provider_slug="shopify",
            credentials={"shop_domain": "test-shop.myshopify.com", "access_token": "test-token"},
        )

    @patch("apps.ai.ai_core.services.llm_router.LLMRouter.get_llm_for_module")
    @patch("apps.integrations.providers.shopify.client.ShopifyIntegrationClient.execute_tool")
    def test_agent_loop_executes_tool_and_feeds_back(self, mock_execute_tool, mock_get_llm) -> None:
        # 1. Setup mock Shopify execution
        mock_execute_tool.return_value = [{"title": "Shirt"}, {"title": "Pants"}]

        # 2. Setup mock LLM responses
        mock_llm = MagicMock(spec=BaseLLMService)
        mock_llm.provider_name = "mock-openai"
        mock_llm._model = "gpt-4o"
        mock_llm.default_model = "gpt-4o"

        # First generate call returns tool call; second returns text response
        mock_llm.generate.side_effect = [
            LLMResponse(
                content="",
                model="gpt-4o",
                tokens_input=10,
                tokens_output=15,
                tool_calls=[{"id": "call_123", "name": "shopify_get_products", "arguments": {"limit": 2}}],
            ),
            LLMResponse(
                content="Here are the shopify products: Shirt and Pants.",
                model="gpt-4o",
                tokens_input=25,
                tokens_output=12,
            ),
        ]
        mock_get_llm.return_value = mock_llm

        # 3. Trigger the loop
        response = LLMRouter.generate_with_tools(
            organization=self.organization,
            module_slug="email_marketing",
            prompt="List my products",
        )

        # 4. Verify loop behavior
        self.assertEqual(response.content, "Here are the shopify products: Shirt and Pants.")
        self.assertEqual(response.tokens_input, 35) # 10 + 25
        self.assertEqual(response.tokens_output, 27) # 15 + 12

        # Check that shopify tool was executed
        mock_execute_tool.assert_called_once_with("shopify_get_products", {"limit": 2})

        # Verify messages list passed to mock LLM on the second turn
        call_args_list = mock_llm.generate.call_args_list
        self.assertEqual(len(call_args_list), 2)
        
        # Second call should include history
        second_call_kwargs = call_args_list[1][1]
        second_call_messages = second_call_kwargs["messages"]
        self.assertEqual(len(second_call_messages), 3) # user prompt, assistant tool call, tool response
        self.assertEqual(second_call_messages[0]["role"], "user")
        self.assertEqual(second_call_messages[1]["role"], "assistant")
        self.assertEqual(second_call_messages[1]["tool_calls"][0]["name"], "shopify_get_products")
        self.assertEqual(second_call_messages[2]["role"], "tool")
        self.assertEqual(second_call_messages[2]["content"], json.dumps([{"title": "Shirt"}, {"title": "Pants"}]))

        # Verify usage tracking
        self.assertEqual(
            AIUsageRecord.objects.filter(
                organization=self.organization,
                module_slug="email_marketing",
                model="gpt-4o",
            ).count(),
            1,
        )
        usage = AIUsageRecord.objects.first()
        self.assertEqual(usage.tokens_input, 35)
        self.assertEqual(usage.tokens_output, 27)
