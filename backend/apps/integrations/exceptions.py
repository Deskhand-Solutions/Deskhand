from shared.exceptions.base import DeskhandError


class IntegrationError(DeskhandError):
    """Base error for third-party integration failures."""


class IntegrationNotRegisteredError(IntegrationError):
    """Raised when an unknown integration slug is requested."""


class IntegrationNotConnectedError(IntegrationError):
    """Raised when an organization has no active connection for a provider."""
