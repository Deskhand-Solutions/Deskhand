from django.contrib.auth import get_user_model

from apps.core.administration.models import AuditLog
from apps.core.organizations.models import Organization

User = get_user_model()


class AuditService:
    @staticmethod
    def log(
        *,
        action: str,
        resource_type: str,
        resource_id: str = "",
        user: User | None = None,
        organization: Organization | None = None,
        metadata: dict | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        return AuditLog.objects.create(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user=user,
            organization=organization,
            metadata=metadata or {},
            ip_address=ip_address,
        )
