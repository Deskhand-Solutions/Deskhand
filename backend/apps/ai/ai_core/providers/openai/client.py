import json

from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.providers._http import post_json
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class OpenAILLMService(BaseLLMService):
    """OpenAI Chat Completions provider."""

    provider_name = "openai"
    default_model = "gpt-4o-mini"
    _DEFAULT_BASE_URL = "https://api.openai.com/v1"

    def generate(
        self,
        prompt: str | None = None,
        *,
        messages: list[dict] | None = None,
        model: str | None = None,
        tools: list[dict] | None = None,
    ) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("OpenAI API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL

        # Build messages payload
        openai_messages = []
        if messages:
            for msg in messages:
                o_msg = {"role": msg["role"]}
                if msg.get("content") is not None:
                    o_msg["content"] = msg["content"]
                
                # Assistant request for tool calls
                if msg["role"] == "assistant" and "tool_calls" in msg:
                    o_msg["tool_calls"] = []
                    for tc in msg["tool_calls"]:
                        o_msg["tool_calls"].append({
                            "id": tc["id"],
                            "type": "function",
                            "function": {
                                "name": tc["name"],
                                "arguments": json.dumps(tc["arguments"]),
                            }
                        })
                # Tool responses back to model
                elif msg["role"] == "tool":
                    o_msg["tool_call_id"] = msg["tool_call_id"]
                    o_msg["name"] = msg["name"]
                
                openai_messages.append(o_msg)
        else:
            openai_messages = [{"role": "user", "content": prompt or ""}]

        payload = {
            "model": used_model,
            "messages": openai_messages,
        }

        # Add tools schema if provided
        if tools:
            openai_tools = []
            for tool in tools:
                openai_tools.append({
                    "type": "function",
                    "function": {
                        "name": tool["name"],
                        "description": tool.get("description", ""),
                        "parameters": tool.get("parameters", {}),
                    }
                })
            payload["tools"] = openai_tools

        data = post_json(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
        )

        choices = data.get("choices", [])
        content = ""
        tool_calls = []
        if choices:
            message = choices[0].get("message", {})
            content = message.get("content") or ""
            if "tool_calls" in message:
                for tc in message["tool_calls"]:
                    fn = tc.get("function", {})
                    args_str = fn.get("arguments", "{}")
                    try:
                        args = json.loads(args_str)
                    except Exception:
                        args = {}
                    tool_calls.append({
                        "id": tc.get("id"),
                        "name": fn.get("name"),
                        "arguments": args,
                    })

        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            model=data.get("model", used_model),
            tokens_input=usage.get("prompt_tokens", 0),
            tokens_output=usage.get("completion_tokens", 0),
            tool_calls=tool_calls,
        )

