from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class IntegrationCredentials:
    """Opaque credential payload for a provider connection."""

    access_token: str = ""
    refresh_token: str = ""
    extra: dict[str, Any] = field(default_factory=dict)


class BaseIntegrationClient(ABC):
    """
    Shared contract for external providers (Google, Shopify, …).

    Module services obtain clients via `connection_service.get_client_for_organization`.
    """

    provider_slug: str = ""
    display_name: str = ""

    def __init__(self, *, credentials: IntegrationCredentials | None = None) -> None:
        self._credentials = credentials or IntegrationCredentials()

    @property
    def is_configured(self) -> bool:
        return bool(self._credentials.access_token)

    @abstractmethod
    def health_check(self) -> bool:
        """Lightweight connectivity check; must not mutate remote state."""
        raise NotImplementedError

    def get_tools(self) -> list[dict]:
        """
        Returns a list of JSON-schema dictionaries for the tools this client provides.
        Example output format:
        [
            {
                "name": "shopify_get_products",
                "description": "Fetch products",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "limit": {"type": "integer"}
                    }
                }
            }
        ]
        """
        return []

    def execute_tool(self, name: str, arguments: dict) -> Any:
        """Executes the tool with the given name and arguments."""
        raise NotImplementedError(f"Tool '{name}' is not implemented on client '{self.provider_slug}'.")

