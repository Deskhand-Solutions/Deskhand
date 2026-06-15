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

    def generate(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("Anthropic API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL
        data = post_json(
            f"{base_url}/messages",
            headers={
                "x-api-key": self._api_key,
                "anthropic-version": self._API_VERSION,
                "content-type": "application/json",
            },
            payload={
                "model": used_model,
                "max_tokens": self._MAX_TOKENS,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        content = "".join(
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        )
        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            model=data.get("model", used_model),
            tokens_input=usage.get("input_tokens", 0),
            tokens_output=usage.get("output_tokens", 0),
        )
