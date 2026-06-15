from shared.exceptions.base import DeskhandError


class AIError(DeskhandError):
    """Base error for AI/LLM failures."""


class AIProviderNotRegisteredError(AIError):
    """Raised when an unknown AI provider slug is requested."""


class AIProviderNotConfiguredError(AIError):
    """Raised when a provider needs an API key but none is configured for the org."""
