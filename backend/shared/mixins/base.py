from shared.mixins.timestamped import TimestampedModelMixin
from shared.mixins.uuid import UUIDModelMixin


class BaseModel(UUIDModelMixin, TimestampedModelMixin):
    """Basis für neue Business-Models: UUID-PK + Timestamps."""

    class Meta:
        abstract = True
