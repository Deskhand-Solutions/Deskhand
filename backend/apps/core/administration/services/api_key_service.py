import hashlib
import secrets

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.core.administration.models import OrganizationAPIKey
from apps.core.administration.services.audit_service import AuditService
from apps.core.organizations.models import Organization

User = get_user_model()


class APIKeyService:
    PREFIX_LENGTH = 8

    @staticmethod
    def _hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    @staticmethod
    def create_key(
        *,
        organization: Organization,
        name: str,
        created_by: User,
    ) -> tuple[OrganizationAPIKey, str]:
        raw_key = f"dh_{secrets.token_urlsafe(32)}"
        prefix = raw_key[: APIKeyService.PREFIX_LENGTH]
        api_key = OrganizationAPIKey.objects.create(
            organization=organization,
            created_by=created_by,
            name=name,
            key_prefix=prefix,
            key_hash=APIKeyService._hash_key(raw_key),
        )
        AuditService.log(
            action="api_key.create",
            resource_type="api_key",
            resource_id=str(api_key.id),
            user=created_by,
            organization=organization,
            metadata={"name": name},
        )
        return api_key, raw_key

    @staticmethod
    def revoke_key(*, api_key: OrganizationAPIKey, user: User) -> None:
        api_key.is_active = False
        api_key.save(update_fields=["is_active", "updated_at"])
        AuditService.log(
            action="api_key.revoke",
            resource_type="api_key",
            resource_id=str(api_key.id),
            user=user,
            organization=api_key.organization,
        )

    @staticmethod
    def validate_key(*, raw_key: str, organization: Organization) -> OrganizationAPIKey | None:
        prefix = raw_key[: APIKeyService.PREFIX_LENGTH]
        key_hash = APIKeyService._hash_key(raw_key)
        api_key = (
            OrganizationAPIKey.objects.filter(
                organization=organization,
                key_prefix=prefix,
                key_hash=key_hash,
                is_active=True,
            )
            .first()
        )
        if api_key is None:
            return None

        if api_key.expires_at and api_key.expires_at < timezone.now():
            return None

        api_key.last_used_at = timezone.now()
        api_key.save(update_fields=["last_used_at", "updated_at"])
        return api_key
