import uuid
from uuid import UUID

from django.contrib.auth import get_user_model

from apps.modules.email_marketing.models import EmailProject, EmailProjectStatus
from apps.modules.email_marketing.selectors import get_project_for_organization

User = get_user_model()

MAX_IMAGE_ASSETS = 6
MAX_IMAGE_DATA_URL_LENGTH = 2_000_000


class EmailProjectService:
    @staticmethod
    def create_project(
        *,
        organization,
        created_by: User | None,
        title: str,
        context: str = "",
        style_guidelines: str = "",
        subject_line: str = "",
        image_assets: list | None = None,
    ) -> EmailProject:
        base_title = title.strip() or "Neue Marketing-E-Mail"
        final_title = base_title
        counter = 1
        while EmailProject.objects.filter(organization=organization, title=final_title).exists():
            counter += 1
            final_title = f"{base_title} ({counter})"

        return EmailProject.objects.create(
            organization=organization,
            created_by=created_by,
            title=final_title,
            context=context.strip(),
            style_guidelines=style_guidelines.strip(),
            subject_line=subject_line.strip(),
            image_assets=EmailProjectService._sanitize_images(image_assets or []),
            status=EmailProjectStatus.DRAFT,
        )

    @staticmethod
    def update_project(
        *,
        organization_id: int,
        project_id: UUID,
        data: dict,
    ) -> EmailProject:
        project = get_project_for_organization(
            organization_id=organization_id,
            project_id=project_id,
        )
        if project is None:
            raise ValueError("Projekt nicht gefunden.")

        allowed_fields = {
            "title",
            "context",
            "style_guidelines",
            "subject_line",
            "html_content",
            "image_assets",
        }
        update_fields: list[str] = []
        for field, value in data.items():
            if field not in allowed_fields:
                continue
            if field == "image_assets":
                value = EmailProjectService._sanitize_images(value)
            if field in {"title", "context", "style_guidelines", "subject_line"}:
                value = str(value).strip()
            setattr(project, field, value)
            update_fields.append(field)

        if update_fields:
            if "html_content" in update_fields:
                project.status = EmailProjectStatus.GENERATED
                update_fields.append("status")
            update_fields.append("updated_at")
            project.save(update_fields=update_fields)
        return project

    @staticmethod
    def delete_project(*, organization_id: int, project_id: UUID) -> None:
        project = get_project_for_organization(
            organization_id=organization_id,
            project_id=project_id,
        )
        if project is None:
            raise ValueError("Projekt nicht gefunden.")
        project.delete()

    @staticmethod
    def _sanitize_images(raw_assets: list) -> list[dict]:
        if not isinstance(raw_assets, list):
            return []
        sanitized: list[dict] = []
        for asset in raw_assets[:MAX_IMAGE_ASSETS]:
            if not isinstance(asset, dict):
                continue
            data_url = str(asset.get("data_url") or "").strip()
            if not data_url.startswith("data:image/"):
                continue
            if len(data_url) > MAX_IMAGE_DATA_URL_LENGTH:
                continue
            sanitized.append(
                {
                    "id": str(asset.get("id") or uuid.uuid4()),
                    "alt_text": str(asset.get("alt_text") or "Bild")[:200],
                    "data_url": data_url,
                },
            )
        return sanitized
