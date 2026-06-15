from django.conf import settings
from rest_framework.response import Response


class AuthCookieService:
    @staticmethod
    def _cookie_kwargs(*, max_age: int) -> dict:
        return {
            "httponly": settings.AUTH_COOKIE_HTTP_ONLY,
            "secure": settings.AUTH_COOKIE_SECURE,
            "samesite": settings.AUTH_COOKIE_SAMESITE,
            "max_age": max_age,
        }

    @classmethod
    def set_auth_cookies(cls, response: Response, tokens: dict) -> Response:
        access_lifetime = int(
            settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
        )
        refresh_lifetime = int(
            settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
        )

        response.set_cookie(
            key=settings.AUTH_COOKIE_ACCESS,
            value=tokens["access"],
            path=settings.AUTH_COOKIE_ACCESS_PATH,
            **cls._cookie_kwargs(max_age=access_lifetime),
        )
        response.set_cookie(
            key=settings.AUTH_COOKIE_REFRESH,
            value=tokens["refresh"],
            path=settings.AUTH_COOKIE_REFRESH_PATH,
            **cls._cookie_kwargs(max_age=refresh_lifetime),
        )
        return response

    @classmethod
    def clear_auth_cookies(cls, response: Response) -> Response:
        response.delete_cookie(
            settings.AUTH_COOKIE_ACCESS,
            path=settings.AUTH_COOKIE_ACCESS_PATH,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )
        response.delete_cookie(
            settings.AUTH_COOKIE_REFRESH,
            path=settings.AUTH_COOKIE_REFRESH_PATH,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )
        return response

    @staticmethod
    def get_refresh_token(request) -> str | None:
        return request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
