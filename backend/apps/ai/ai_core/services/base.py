from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class LLMResponse:
    content: str
    model: str
    tokens_input: int = 0
    tokens_output: int = 0
    tool_calls: list[dict] = field(default_factory=list)


class BaseLLMService(ABC):
    """
    Basis-Schnittstelle für LLM-Provider.

    Provider erhalten Key/Model/Base-URL über den Konstruktor — die Werte
    injiziert der ``LLMRouter`` pro Organisation aus den gespeicherten
    ``AIProviderCredential``-Datensätzen. Module instanziieren Provider niemals
    selbst, sondern beziehen sie über ``get_llm_for_module``.
    """

    provider_name: str = "base"
    default_model: str = ""

    def __init__(self, *, api_key: str = "", model: str = "", base_url: str = "") -> None:
        self._api_key = api_key
        self._model = model or self.default_model
        self._base_url = base_url

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    @abstractmethod
    def generate(
        self,
        prompt: str | None = None,
        *,
        messages: list[dict] | None = None,
        model: str | None = None,
        tools: list[dict] | None = None,
    ) -> LLMResponse:
        raise NotImplementedError

