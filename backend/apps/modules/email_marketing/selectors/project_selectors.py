from uuid import UUID

from apps.modules.email_marketing.models import EmailProject


def list_projects_for_organization(*, organization_id: int) -> list[EmailProject]:
    return list(
        EmailProject.objects.filter(organization_id=organization_id).order_by(
            "-updated_at",
        ),
    )


def get_project_for_organization(
    *,
    organization_id: int,
    project_id: UUID,
) -> EmailProject | None:
    return EmailProject.objects.filter(
        organization_id=organization_id,
        id=project_id,
    ).first()
