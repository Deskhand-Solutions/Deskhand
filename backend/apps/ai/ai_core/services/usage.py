from apps.ai.ai_core.models import AIUsageRecord


class UsageTrackingService:
    @staticmethod
    def track(
        *,
        organization,
        module_slug: str,
        provider: str,
        model: str,
        tokens_input: int,
        tokens_output: int,
    ) -> AIUsageRecord:
        return AIUsageRecord.objects.create(
            organization=organization,
            module_slug=module_slug,
            provider=provider,
            model=model,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
        )
