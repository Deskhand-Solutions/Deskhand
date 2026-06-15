from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.accounts.models import UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance: User, created: bool, **kwargs) -> None:
    if created:
        UserProfile.objects.get_or_create(user=instance)
