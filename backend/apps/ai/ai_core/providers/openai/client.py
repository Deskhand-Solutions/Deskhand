from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.providers._http import post_json
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class OpenAILLMService(BaseLLMService):
    """OpenAI Chat Completions provider."""

    provider_name = "openai"
    default_model = "gpt-4o-mini"
    _DEFAULT_BASE_URL = "https://api.openai.com/v1"

    def generate(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("OpenAI API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL
        data = post_json(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            payload={
                "model": used_model,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        choices = data.get("choices", [])
        content = choices[0]["message"]["content"] if choices else ""
        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            model=data.get("model", used_model),
            tokens_input=usage.get("prompt_tokens", 0),
            tokens_output=usage.get("completion_tokens", 0),
        )
