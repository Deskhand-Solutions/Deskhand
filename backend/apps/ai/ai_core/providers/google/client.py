import json
import uuid

from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.providers._http import post_json
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class GoogleLLMService(BaseLLMService):
    """Google Gemini (Generative Language) provider."""

    provider_name = "google"
    default_model = "gemini-1.5-flash"
    _DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def generate(
        self,
        prompt: str | None = None,
        *,
        messages: list[dict] | None = None,
        model: str | None = None,
        tools: list[dict] | None = None,
    ) -> LLMResponse:
        if not self._api_key:
            raise AIProviderNotConfiguredError("Google API key is not configured.")
        used_model = model or self._model
        base_url = self._base_url or self._DEFAULT_BASE_URL

        # Translate messages
        gemini_contents = []
        if messages:
            for msg in messages:
                role = "user" if msg["role"] in ("user", "tool") else "model"
                parts = []

                if msg["role"] == "user":
                    parts.append({"text": msg.get("content") or ""})
                elif msg["role"] == "assistant":
                    if msg.get("content"):
                        parts.append({"text": msg["content"]})
                    if "tool_calls" in msg:
                        for tc in msg["tool_calls"]:
                            parts.append({
                                "functionCall": {
                                    "name": tc["name"],
                                    "args": tc["arguments"],
                                }
                            })
                elif msg["role"] == "tool":
                    try:
                        resp_obj = json.loads(msg["content"])
                        if not isinstance(resp_obj, dict):
                            resp_obj = {"result": resp_obj}
                    except Exception:
                        resp_obj = {"result": msg["content"]}
                    
                    parts.append({
                        "functionResponse": {
                            "name": msg["name"],
                            "response": resp_obj,
                        }
                    })

                # Merge parts of alternating roles
                if gemini_contents and gemini_contents[-1]["role"] == role:
                    gemini_contents[-1]["parts"].extend(parts)
                else:
                    gemini_contents.append({"role": role, "parts": parts})
        else:
            gemini_contents = [{"role": "user", "parts": [{"text": prompt or ""}]}]

        payload = {
            "contents": gemini_contents,
        }

        # Translate tools to function declarations
        if tools:
            declarations = []
            for tool in tools:
                declarations.append({
                    "name": tool["name"],
                    "description": tool.get("description", ""),
                    "parameters": tool.get("parameters", {}),
                })
            payload["tools"] = [{"functionDeclarations": declarations}]

        data = post_json(
            f"{base_url}/models/{used_model}:generateContent?key={self._api_key}",
            headers={"Content-Type": "application/json"},
            payload=payload,
        )

        candidates = data.get("candidates", [])
        content = ""
        tool_calls = []
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            for part in parts:
                if "text" in part:
                    content += part["text"]
                elif "functionCall" in part:
                    fc = part["functionCall"]
                    tool_calls.append({
                        "id": f"call_{uuid.uuid4().hex[:8]}",
                        "name": fc.get("name"),
                        "arguments": fc.get("args", {}),
                    })

        meta = data.get("usageMetadata", {})
        return LLMResponse(
            content=content,
            model=used_model,
            tokens_input=meta.get("promptTokenCount", 0),
            tokens_output=meta.get("candidatesTokenCount", 0),
            tool_calls=tool_calls,
        )

