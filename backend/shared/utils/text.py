from django.utils.text import slugify


def slugify_value(value: str) -> str:
    return slugify(value, allow_unicode=False)
