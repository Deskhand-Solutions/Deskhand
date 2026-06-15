from apps.core.organizations.models import Organization


class OrganizationScopedService:
    """Basis für Services mit Mandanten-Kontext."""

    def __init__(self, organization: Organization) -> None:
        self.organization = organization
