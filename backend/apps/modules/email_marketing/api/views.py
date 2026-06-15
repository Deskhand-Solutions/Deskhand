from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.modules.email_marketing.api.serializers import (
    EmailProjectCreateSerializer,
    EmailProjectSerializer,
    EmailProjectUpdateSerializer,
)
from apps.modules.email_marketing.permissions import RequiresEmailMarketingModule
from apps.modules.email_marketing.selectors import (
    get_project_for_organization,
    list_projects_for_organization,
)
from apps.modules.email_marketing.services import EmailGenerationService, EmailProjectService
from shared.permissions import IsOrganizationMember


class EmailProjectListCreateView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOrganizationMember,
        RequiresEmailMarketingModule,
    ]

    def get(self, request):
        organization = request.organization
        projects = list_projects_for_organization(organization_id=organization.id)
        serializer = EmailProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmailProjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            project = EmailProjectService.create_project(
                organization=request.organization,
                created_by=request.user,
                title=data["title"],
                context=data.get("context", ""),
                style_guidelines=data.get("style_guidelines", ""),
                subject_line=data.get("subject_line", ""),
                image_assets=data.get("image_assets", []),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"detail": "Ein Projekt mit diesem Namen existiert bereits."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            EmailProjectSerializer(project).data,
            status=status.HTTP_201_CREATED,
        )


class EmailProjectDetailView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOrganizationMember,
        RequiresEmailMarketingModule,
    ]

    def _get_project(self, request, project_id):
        return get_project_for_organization(
            organization_id=request.organization.id,
            project_id=project_id,
        )

    def get(self, request, project_id):
        project = self._get_project(request, project_id)
        if project is None:
            return Response({"detail": "Projekt nicht gefunden."}, status=404)
        return Response(EmailProjectSerializer(project).data)

    def patch(self, request, project_id):
        serializer = EmailProjectUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            project = EmailProjectService.update_project(
                organization_id=request.organization.id,
                project_id=project_id,
                data=serializer.validated_data,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response(
                {"detail": "Ein Projekt mit diesem Namen existiert bereits."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(EmailProjectSerializer(project).data)

    def delete(self, request, project_id):
        try:
            EmailProjectService.delete_project(
                organization_id=request.organization.id,
                project_id=project_id,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmailProjectGenerateView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOrganizationMember,
        RequiresEmailMarketingModule,
    ]

    def post(self, request, project_id):
        project = get_project_for_organization(
            organization_id=request.organization.id,
            project_id=project_id,
        )
        if project is None:
            return Response({"detail": "Projekt nicht gefunden."}, status=404)

        if not project.context.strip():
            return Response(
                {"detail": "Bitte zuerst Kontext für die E-Mail angeben."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refinement_prompt = request.data.get("refinement_prompt")
        generator = EmailGenerationService(organization=request.organization)
        project = generator.generate_html(project, refinement_prompt=refinement_prompt)
        return Response(EmailProjectSerializer(project).data)
