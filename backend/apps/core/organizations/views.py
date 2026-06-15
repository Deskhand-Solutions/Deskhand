from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.core.organizations.selectors.organization_selectors import get_user_organizations

from .serializers import OrganizationSerializer


class OrganizationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return get_user_organizations(self.request.user)
