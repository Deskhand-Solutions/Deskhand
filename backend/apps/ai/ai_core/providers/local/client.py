from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class LocalLLMService(BaseLLMService):
    """
    Deterministic offline provider — no external API key required.

    Default fallback so modules keep working in dev / before a real provider key
    is configured. Produces a predictable plain-text echo, never a network call.
    """

    provider_name = "local"
    default_model = "deskhand-local-v1"

    @property
    def is_configured(self) -> bool:
        return True

    def generate(
        self,
        prompt: str | None = None,
        *,
        messages: list[dict] | None = None,
        model: str | None = None,
        tools: list[dict] | None = None,
    ) -> LLMResponse:
        if messages:
            prompt_text = " ".join(msg.get("content") or "" for msg in messages)
        else:
            prompt_text = prompt or ""
        content = self._compose(prompt_text)
        return LLMResponse(
            content=content,
            model=model or self._model,
            tokens_input=len(prompt_text.split()),
            tokens_output=len(content.split()),
        )

    def _compose(self, prompt: str) -> str:
        stripped = prompt.strip()
        first_line = stripped.splitlines()[0][:200] if stripped else ""
        return f"[Deskhand lokale KI] {first_line}".strip()
