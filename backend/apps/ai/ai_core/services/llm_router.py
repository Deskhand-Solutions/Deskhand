"""
Module-facing entry point for AI.

A module gets a ready-to-use, organization-keyed LLM client in one call —
without ever touching provider SDKs, API keys, or model selection:

    from apps.ai.ai_core.services.llm_router import LLMRouter

    response = LLMRouter.generate_for_module(
        organization=org,
        module_slug="chatbot",
        prompt=prompt,
    )

Routing resolves: ModuleAIBinding (org-specific) → DESKHAND_DEFAULT_AI_PROVIDER
→ provider registry → decrypted AIProviderCredential → configured client.
"""

from django.conf import settings

from apps.ai.ai_core.exceptions import AIProviderNotConfiguredError
from apps.ai.ai_core.registry import get_ai_provider
from apps.ai.ai_core.selectors import get_credential, get_module_binding
from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse
from apps.ai.ai_core.services.credential_service import AICredentialService
from apps.ai.ai_core.services.usage import UsageTrackingService

_LOCAL_PROVIDER = "local"


class LLMRouter:
    @staticmethod
    def get_llm_for_module(
        *,
        organization,
        module_slug: str,
        fallback_to_local: bool = True,
    ) -> BaseLLMService:
        binding = get_module_binding(
            organization_id=organization.id,
            module_slug=module_slug,
        )
        if binding is not None:
            provider_slug = binding.provider
            model = binding.model
        else:
            provider_slug = getattr(
                settings, "DESKHAND_DEFAULT_AI_PROVIDER", _LOCAL_PROVIDER
            )
            model = ""

        return LLMRouter._build_client(
            organization=organization,
            provider_slug=provider_slug,
            model=model,
            fallback_to_local=fallback_to_local,
        )

    @staticmethod
    def _build_client(
        *,
        organization,
        provider_slug: str,
        model: str,
        fallback_to_local: bool,
    ) -> BaseLLMService:
        definition = get_ai_provider(provider_slug)

        if not definition.requires_api_key:
            return definition.client_class(model=model)

        credential = get_credential(
            organization_id=organization.id,
            provider=provider_slug,
        )
        api_key = (
            AICredentialService.get_api_key(credential)
            if credential is not None and credential.is_active
            else ""
        )

        if not api_key:
            if fallback_to_local:
                return get_ai_provider(_LOCAL_PROVIDER).client_class(model=model)
            raise AIProviderNotConfiguredError(
                f"No active '{provider_slug}' credential for organization "
                f"{organization.id}.",
            )

        return definition.client_class(
            api_key=api_key,
            model=model,
            base_url=credential.base_url,
        )

    @staticmethod
    def generate_for_module(
        *,
        organization,
        module_slug: str,
        prompt: str,
        fallback_to_local: bool = True,
    ) -> LLMResponse:
        """Generate + usage tracking in one call (recommended for modules)."""
        llm = LLMRouter.get_llm_for_module(
            organization=organization,
            module_slug=module_slug,
            fallback_to_local=fallback_to_local,
        )
        response = llm.generate(prompt)
        UsageTrackingService.track(
            organization=organization,
            module_slug=module_slug,
            provider=llm.provider_name,
            model=response.model,
            tokens_input=response.tokens_input,
            tokens_output=response.tokens_output,
        )
        return response

    @staticmethod
    def generate_with_tools(
        *,
        organization,
        module_slug: str,
        prompt: str,
        fallback_to_local: bool = True,
        max_turns: int = 5,
    ) -> LLMResponse:
        """
        Runs an in-process agent tool-calling loop. Compiles active integration
        tools for the organization, executes requested tools in a loop, and
        records aggregate usage.
        """
        import json
        from apps.integrations.models import IntegrationConnection, IntegrationConnectionStatus
        from apps.integrations.services.connection_service import get_client_for_organization

        llm = LLMRouter.get_llm_for_module(
            organization=organization,
            module_slug=module_slug,
            fallback_to_local=fallback_to_local,
        )

        # Retrieve active integrations for the organization
        connections = IntegrationConnection.objects.filter(
            organization=organization,
            status=IntegrationConnectionStatus.CONNECTED,
        )

        clients = []
        for conn in connections:
            try:
                client = get_client_for_organization(
                    organization_id=organization.id,
                    provider_slug=conn.provider_slug,
                    require_connected=True,
                )
                clients.append(client)
            except Exception:
                continue

        # Compile tool definitions and tool mapping
        tools_map = {}
        tools_list = []
        for client in clients:
            try:
                client_tools = client.get_tools()
                for tool in client_tools:
                    name = tool["name"]
                    tools_map[name] = client
                    tools_list.append(tool)
            except Exception:
                continue

        # Execution loop
        messages = [{"role": "user", "content": prompt}]
        total_input_tokens = 0
        total_output_tokens = 0
        final_content = ""
        final_model = llm._model or llm.default_model

        for turn in range(max_turns):
            response = llm.generate(
                messages=list(messages),
                tools=tools_list if tools_list else None,
            )
            total_input_tokens += response.tokens_input
            total_output_tokens += response.tokens_output
            final_model = response.model

            # Record assistant message
            assistant_msg = {"role": "assistant"}
            if response.content:
                assistant_msg["content"] = response.content
                final_content = response.content
            if response.tool_calls:
                assistant_msg["tool_calls"] = response.tool_calls
            messages.append(assistant_msg)

            # If no tool calls were requested, we are done
            if not response.tool_calls:
                break

            # Execute tool calls
            for tool_call in response.tool_calls:
                tool_id = tool_call.get("id")
                tool_name = tool_call.get("name")
                tool_args = tool_call.get("arguments", {})

                if tool_name in tools_map:
                    client = tools_map[tool_name]
                    try:
                        result = client.execute_tool(tool_name, tool_args)
                        result_str = (
                            json.dumps(result)
                            if isinstance(result, (dict, list))
                            else str(result)
                        )
                    except Exception as exc:
                        result_str = f"Error executing tool {tool_name}: {exc}"
                else:
                    result_str = f"Error: Tool '{tool_name}' not found."

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_id,
                    "name": tool_name,
                    "content": result_str,
                })

        # Track aggregate usage
        UsageTrackingService.track(
            organization=organization,
            module_slug=module_slug,
            provider=llm.provider_name,
            model=final_model,
            tokens_input=total_input_tokens,
            tokens_output=total_output_tokens,
        )

        return LLMResponse(
            content=final_content,
            model=final_model,
            tokens_input=total_input_tokens,
            tokens_output=total_output_tokens,
        )


def get_llm_for_module(
    *,
    organization,
    module_slug: str,
    fallback_to_local: bool = True,
) -> BaseLLMService:
    """Convenience wrapper around ``LLMRouter.get_llm_for_module``."""
    return LLMRouter.get_llm_for_module(
        organization=organization,
        module_slug=module_slug,
        fallback_to_local=fallback_to_local,
    )


def generate_with_tools(
    *,
    organization,
    module_slug: str,
    prompt: str,
    fallback_to_local: bool = True,
    max_turns: int = 5,
) -> LLMResponse:
    """Convenience wrapper around ``LLMRouter.generate_with_tools``."""
    return LLMRouter.generate_with_tools(
        organization=organization,
        module_slug=module_slug,
        prompt=prompt,
        fallback_to_local=fallback_to_local,
        max_turns=max_turns,
    )

