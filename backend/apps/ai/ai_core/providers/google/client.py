from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.providers._http import post_json
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class GoogleLLMService(BaseLLMService):
    """Google Gemini (Generative Language) provider."""

    provider_name = "google"
    default_model = "gemini-1.5-flash"
    _DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def generate(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("Google API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL
        data = post_json(
            f"{base_url}/models/{used_model}:generateContent?key={self._api_key}",
            headers={"Content-Type": "application/json"},
            payload={"contents": [{"parts": [{"text": prompt}]}]},
        )
        candidates = data.get("candidates", [])
        content = ""
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            content = "".join(part.get("text", "") for part in parts)
        meta = data.get("usageMetadata", {})
        return LLMResponse(
            content=content,
            model=used_model,
            tokens_input=meta.get("promptTokenCount", 0),
            tokens_output=meta.get("candidatesTokenCount", 0),
        )
