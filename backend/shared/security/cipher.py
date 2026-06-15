"""
Pluggable symmetric encryption for secrets at rest (provider API keys,
integration credentials).

Used by both ``apps.ai.ai_core`` and ``apps.integrations`` — therefore it lives
in ``shared`` (cross-cutting only).

Resolution order (``get_secrets_cipher``):
  1. ``Fernet`` when the ``cryptography`` package is importable *and*
     ``settings.DESKHAND_SECRETS_KEY`` is set → production-grade encryption.
  2. ``InsecureDevCipher`` otherwise → reversible obfuscation for local dev.
     Logs a warning when ``DEBUG`` is off so misconfigured prod is loud.

Payloads are tagged with a short prefix so ``decrypt`` can tell ciphertext
apart from legacy plaintext (the previous code stored raw values). Unknown /
untagged values are returned unchanged, which keeps existing rows readable
during the migration window.
"""

from __future__ import annotations

import base64
import hashlib
import logging
from typing import Protocol, runtime_checkable

from django.conf import settings

logger = logging.getLogger(__name__)

_FERNET_PREFIX = "fernet:"
_DEV_PREFIX = "devenc:"


@runtime_checkable
class SecretsCipher(Protocol):
    """Contract for at-rest secret encryption. Swap implementations freely."""

    def encrypt(self, plaintext: str) -> str: ...

    def decrypt(self, token: str) -> str: ...


class FernetSecretsCipher:
    """Authenticated symmetric encryption via ``cryptography``'s Fernet."""

    def __init__(self, fernet) -> None:  # type: ignore[no-untyped-def]
        self._fernet = fernet

    def encrypt(self, plaintext: str) -> str:
        if not plaintext:
            return ""
        token = self._fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")
        return f"{_FERNET_PREFIX}{token}"

    def decrypt(self, token: str) -> str:
        if not token:
            return ""
        if token.startswith(_FERNET_PREFIX):
            from cryptography.fernet import InvalidToken

            raw = token[len(_FERNET_PREFIX):]
            try:
                return self._fernet.decrypt(raw.encode("utf-8")).decode("utf-8")
            except InvalidToken:
                logger.error(
                    "Fernet decrypt failed (wrong DESKHAND_SECRETS_KEY?); "
                    "treating secret as unset.",
                )
                return ""
        if token.startswith(_DEV_PREFIX):
            return _dev_decode(token)
        return token  # legacy plaintext


class InsecureDevCipher:
    """
    Reversible base64 obfuscation. NOT cryptographically secure — only for local
    development where no key/``cryptography`` is available. Never relied upon in
    production (a warning is emitted when ``DEBUG`` is off).
    """

    def encrypt(self, plaintext: str) -> str:
        if not plaintext:
            return ""
        encoded = base64.urlsafe_b64encode(plaintext.encode("utf-8")).decode("utf-8")
        return f"{_DEV_PREFIX}{encoded}"

    def decrypt(self, token: str) -> str:
        if not token:
            return ""
        if token.startswith(_DEV_PREFIX):
            return _dev_decode(token)
        if token.startswith(_FERNET_PREFIX):
            logger.error(
                "Found Fernet-encrypted secret but Fernet cipher is unavailable "
                "(install cryptography and set DESKHAND_SECRETS_KEY).",
            )
            return ""
        return token  # legacy plaintext


def _dev_decode(token: str) -> str:
    raw = token[len(_DEV_PREFIX):]
    try:
        return base64.urlsafe_b64decode(raw.encode("utf-8")).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return ""


def get_secrets_cipher() -> SecretsCipher:
    """
    Return the active cipher. Not cached so ``@override_settings`` works in tests.
    """
    raw_key = getattr(settings, "DESKHAND_SECRETS_KEY", "") or ""
    if raw_key:
        try:
            from cryptography.fernet import Fernet
        except ImportError:
            logger.warning(
                "DESKHAND_SECRETS_KEY is set but 'cryptography' is not installed; "
                "falling back to InsecureDevCipher.",
            )
        else:
            # Accept any passphrase: derive a valid 32-byte url-safe Fernet key.
            fernet_key = base64.urlsafe_b64encode(
                hashlib.sha256(raw_key.encode("utf-8")).digest()
            )
            return FernetSecretsCipher(Fernet(fernet_key))
    elif not getattr(settings, "DEBUG", False):
        logger.warning(
            "DESKHAND_SECRETS_KEY is not set; secrets are stored with the insecure "
            "dev cipher. Set it before going to production.",
        )
    return InsecureDevCipher()


def mask_secret(value: str, *, visible: int = 4) -> str:
    """``"sk-live-abcd1234"`` → ``"••••••••1234"`` for safe display."""
    if not value:
        return ""
    if len(value) <= visible:
        return "•" * len(value)
    return "•" * 8 + value[-visible:]


def key_fingerprint(value: str, *, prefix_len: int = 3, last: int = 4) -> tuple[str, str]:
    """Return ``(prefix, last4)`` for masked display without storing the secret."""
    if not value:
        return "", ""
    prefix = value[:prefix_len]
    last4 = value[-last:] if len(value) > last else value
    return prefix, last4
