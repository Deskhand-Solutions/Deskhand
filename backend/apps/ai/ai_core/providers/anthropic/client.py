from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.providers._http import post_json
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class AnthropicLLMService(BaseLLMService):
    """Anthropic Claude Messages provider."""

    provider_name = "anthropic"
    default_model = "claude-sonnet-4-6"
    _DEFAULT_BASE_URL = "https://api.anthropic.com/v1"
    _API_VERSION = "2023-06-01"
    _MAX_TOKENS = 2048

    def generate(
        self,
        prompt: str | None = None,
        *,
        messages: list[dict] | None = None,
        model: str | None = None,
        tools: list[dict] | None = None,
    ) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("Anthropic API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL

        # Translate messages to Anthropic alternating format
        anthropic_messages = []
        if messages:
            for msg in messages:
                role = msg["role"]
                content = msg.get("content") or ""

                if role == "user":
                    anthropic_messages.append({"role": "user", "content": content})
                elif role == "assistant":
                    content_blocks = []
                    if content:
                        content_blocks.append({"type": "text", "text": content})
                    if "tool_calls" in msg:
                        for tc in msg["tool_calls"]:
                            content_blocks.append({
                                "type": "tool_use",
                                "id": tc["id"],
                                "name": tc["name"],
                                "input": tc["arguments"],
                            })
                    if not content_blocks:
                        content_blocks.append({"type": "text", "text": ""})
                    anthropic_messages.append({"role": "assistant", "content": content_blocks})
                elif role == "tool":
                    tool_result_block = {
                        "type": "tool_result",
                        "tool_use_id": msg["tool_call_id"],
                        "content": content,
                    }
                    if anthropic_messages and anthropic_messages[-1]["role"] == "user":
                        prev_content = anthropic_messages[-1]["content"]
                        if isinstance(prev_content, list):
                            prev_content.append(tool_result_block)
                        else:
                            anthropic_messages[-1]["content"] = [
                                {"type": "text", "text": prev_content},
                                tool_result_block,
                            ]
                    else:
                        anthropic_messages.append({
                            "role": "user",
                            "content": [tool_result_block]
                        })
        else:
            anthropic_messages = [{"role": "user", "content": prompt or ""}]

        payload = {
            "model": used_model,
            "max_tokens": self._MAX_TOKENS,
            "messages": anthropic_messages,
        }

        # Translate tools to Anthropic format
        if tools:
            anthropic_tools = []
            for tool in tools:
                anthropic_tools.append({
                    "name": tool["name"],
                    "description": tool.get("description", ""),
                    "input_schema": tool.get("parameters", {}),
                })
            payload["tools"] = anthropic_tools

        data = post_json(
            f"{base_url}/messages",
            headers={
                "x-api-key": self._api_key,
                "anthropic-version": self._API_VERSION,
                "content-type": "application/json",
            },
            payload=payload,
        )

        content_list = data.get("content", [])
        content = "".join(
            block.get("text", "")
            for block in content_list
            if block.get("type") == "text"
        )
        tool_calls = []
        for block in content_list:
            if block.get("type") == "tool_use":
                tool_calls.append({
                    "id": block.get("id"),
                    "name": block.get("name"),
                    "arguments": block.get("input", {}),
                })

        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            model=data.get("model", used_model),
            tokens_input=usage.get("input_tokens", 0),
            tokens_output=usage.get("output_tokens", 0),
            tool_calls=tool_calls,
        )

