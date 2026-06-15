from django.test import SimpleTestCase, override_settings

from shared.security.cipher import (
    FernetSecretsCipher,
    InsecureDevCipher,
    get_secrets_cipher,
    key_fingerprint,
    mask_secret,
)


class MaskSecretTests(SimpleTestCase):
    def test_masks_long_value_keeping_last_four(self) -> None:
        self.assertEqual(mask_secret("sk-live-abcd1234"), "••••••••1234")

    def test_short_value_fully_masked(self) -> None:
        self.assertEqual(mask_secret("ab"), "••")

    def test_empty_value(self) -> None:
        self.assertEqual(mask_secret(""), "")

    def test_key_fingerprint(self) -> None:
        self.assertEqual(key_fingerprint("sk-live-abcd1234"), ("sk-", "1234"))
        self.assertEqual(key_fingerprint(""), ("", ""))


class InsecureDevCipherTests(SimpleTestCase):
    def setUp(self) -> None:
        self.cipher = InsecureDevCipher()

    def test_round_trip(self) -> None:
        token = self.cipher.encrypt("super-secret")
        self.assertNotEqual(token, "super-secret")
        self.assertEqual(self.cipher.decrypt(token), "super-secret")

    def test_empty_round_trip(self) -> None:
        self.assertEqual(self.cipher.encrypt(""), "")
        self.assertEqual(self.cipher.decrypt(""), "")

    def test_legacy_plaintext_passthrough(self) -> None:
        # Values written before encryption was wired must stay readable.
        self.assertEqual(self.cipher.decrypt("legacy-token-123"), "legacy-token-123")


@override_settings(DESKHAND_SECRETS_KEY="unit-test-passphrase")
class FernetCipherResolutionTests(SimpleTestCase):
    def test_resolves_to_fernet_when_key_present(self) -> None:
        cipher = get_secrets_cipher()
        self.assertIsInstance(cipher, FernetSecretsCipher)

    def test_fernet_round_trip(self) -> None:
        cipher = get_secrets_cipher()
        token = cipher.encrypt("anthropic-key")
        self.assertTrue(token.startswith("fernet:"))
        self.assertEqual(cipher.decrypt(token), "anthropic-key")

    def test_fernet_decrypts_legacy_plaintext(self) -> None:
        cipher = get_secrets_cipher()
        self.assertEqual(cipher.decrypt("legacy-plain"), "legacy-plain")


@override_settings(DESKHAND_SECRETS_KEY="")
class DevCipherResolutionTests(SimpleTestCase):
    def test_falls_back_to_dev_cipher_without_key(self) -> None:
        self.assertIsInstance(get_secrets_cipher(), InsecureDevCipher)
