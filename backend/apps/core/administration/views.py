from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.module_registry.registry import get_registered_modules


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response(
        {
            "status": "ok",
            "message": "Deskhand API läuft.",
            "service": "deskhand-backend",
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def platform_info(request):
    return Response(
        {
            "platform": "Deskhand",
            "description": "KI-Beratungs- und Automatisierungsplattform",
            "registered_module_plugins": [
                {
                    "slug": module.slug,
                    "name": module.name,
                    "frontend_route": module.frontend_route,
                }
                for module in get_registered_modules()
            ],
        }
    )
