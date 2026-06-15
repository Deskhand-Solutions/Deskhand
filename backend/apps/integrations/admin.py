import json

from django import forms
from django.contrib import admin

from apps.integrations.models import IntegrationConnection
from apps.integrations.registry import get_integration, get_registered_integrations
from apps.integrations.services.connection_service import encode_credentials


def _parse_extra_json(raw: str) -> dict:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise forms.ValidationError(f"Ungültiges JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise forms.ValidationError("JSON muss ein Objekt sein.")
    return data


def _primary_secret_key(provider_slug: str) -> str:
    definition = get_integration(provider_slug)
    return next(
        (field.key for field in definition.credential_fields if field.secret),
        "access_token",
    )


def _apply_credentials(instance: IntegrationConnection, secret: str, extra: dict) -> None:
    credentials = dict(extra)
    if secret:
        credentials[_primary_secret_key(instance.provider_slug)] = secret
    if credentials:
        definition = get_integration(instance.provider_slug)
        instance.credentials_encrypted, instance.metadata = encode_credentials(
            definition, credentials
        )


class _IntegrationCredentialFields(forms.ModelForm):
    """Dynamically manages form inputs based on the selected integration definition."""

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        choices = [(d.slug, d.name) for d in get_registered_integrations()]
        if choices:
            self.fields["provider_slug"] = forms.ChoiceField(
                label="Provider",
                choices=choices,
                help_text="Wählen Sie einen Provider aus, um die entsprechenden Zugangsdaten einzugeben."
            )

        # Retrieve the relevant provider slug
        provider_slug = None
        if self.instance and getattr(self.instance, "provider_slug", None):
            provider_slug = self.instance.provider_slug
        elif self.data and self.data.get("provider_slug"):
            provider_slug = self.data.get("provider_slug")
        elif self.initial and self.initial.get("provider_slug"):
            provider_slug = self.initial.get("provider_slug")

        if provider_slug:
            try:
                definition = get_integration(provider_slug)
                
                # Try to decode existing encrypted credentials
                current_creds = {}
                if self.instance and self.instance.credentials_encrypted:
                    from apps.integrations.services.connection_service import _decode_credentials
                    try:
                        decoded = _decode_credentials(definition, self.instance.credentials_encrypted)
                        current_creds = decoded.extra or {}
                    except Exception:
                        pass

                # Set initial values for active fields
                for field in definition.credential_fields:
                    field_key = f"cred_{field.key}"
                    if field_key in self.fields:
                        self.fields[field_key].initial = current_creds.get(field.key, "")
            except Exception:
                pass

        # Embed the mapping of provider -> field keys for JavaScript
        defs = {}
        for definition in get_registered_integrations():
            defs[definition.slug] = [f"cred_{field.key}" for field in definition.credential_fields]
        
        self.fields["integration_definitions"] = forms.CharField(
            widget=forms.HiddenInput(attrs={"class": "dh-integration-defs"}),
            required=False,
            initial=json.dumps(defs),
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        provider_slug = self.cleaned_data.get("provider_slug") or instance.provider_slug
        definition = get_integration(provider_slug)

        # Gather credentials from dynamic inputs
        credentials = {}
        for field in definition.credential_fields:
            field_key = f"cred_{field.key}"
            val = self.cleaned_data.get(field_key)
            if val is not None and val != "":
                credentials[field.key] = val
            else:
                # Preserve existing value for secrets if blank
                if field.secret and self.instance and self.instance.credentials_encrypted:
                    from apps.integrations.services.connection_service import _decode_credentials
                    try:
                        decoded = _decode_credentials(definition, self.instance.credentials_encrypted)
                        old_val = (decoded.extra or {}).get(field.key, "")
                        if old_val:
                            credentials[field.key] = old_val
                    except Exception:
                        pass

        # Encrypt and set connection metadata
        _apply_credentials(instance, "", credentials)

        if commit:
            instance.save()
        return instance


class IntegrationConnectionForm(_IntegrationCredentialFields):
    class Meta:
        model = IntegrationConnection
        fields = ["organization", "provider_slug", "status"]

    class Media:
        js = ("admin/js/integration_admin.js",)


class IntegrationConnectionInlineForm(_IntegrationCredentialFields):
    class Meta:
        model = IntegrationConnection
        fields = ["provider_slug", "status"]

    class Media:
        js = ("admin/js/integration_admin.js",)


@admin.register(IntegrationConnection)
class IntegrationConnectionAdmin(admin.ModelAdmin):
    form = IntegrationConnectionForm
    list_display = ("organization", "provider_slug", "status", "masked", "updated_at")
    list_filter = ("provider_slug", "status")
    search_fields = ("organization__name", "provider_slug")
    readonly_fields = ("masked", "created_at", "updated_at")

    @admin.display(description="Secret (maskiert)")
    def masked(self, obj: IntegrationConnection) -> str:
        if isinstance(obj.metadata, dict):
            return obj.metadata.get("masked", "") or "—"
        return "—"

    def get_fields(self, request, obj=None):
        fields = ["organization", "provider_slug", "status", "integration_definitions"]
        for definition in get_registered_integrations():
            for f in definition.credential_fields:
                field_key = f"cred_{f.key}"
                if field_key not in fields:
                    fields.append(field_key)
        return fields


class IntegrationConnectionInline(admin.StackedInline):
    model = IntegrationConnection
    form = IntegrationConnectionInlineForm
    extra = 0
    verbose_name = "Integration"
    verbose_name_plural = "Integrationen (externe Dienste)"

    def get_fields(self, request, obj=None):
        fields = ["provider_slug", "status", "integration_definitions"]
        for definition in get_registered_integrations():
            for f in definition.credential_fields:
                field_key = f"cred_{f.key}"
                if field_key not in fields:
                    fields.append(field_key)
        return fields


_fields_registered = False


def register_dynamic_fields() -> None:
    global _fields_registered
    if _fields_registered:
        return

    # Dynamically attach all possible credential fields and integration_definitions to the classes
    # so that Django modelform_factory validates them correctly without throwing FieldError
    for form_cls in [_IntegrationCredentialFields, IntegrationConnectionForm, IntegrationConnectionInlineForm]:
        # Attach integration_definitions field
        id_field = forms.CharField(
            widget=forms.HiddenInput(attrs={"class": "dh-integration-defs"}),
            required=False,
        )
        form_cls.base_fields["integration_definitions"] = id_field
        form_cls.declared_fields["integration_definitions"] = id_field

        # Attach all credentials fields
        for definition in get_registered_integrations():
            for f in definition.credential_fields:
                field_key = f"cred_{f.key}"
                if f.secret:
                    field = forms.CharField(
                        label=f.label,
                        required=False,
                        widget=forms.PasswordInput(render_value=True),
                        help_text=f.help_text,
                    )
                else:
                    field = forms.CharField(
                        label=f.label,
                        required=False,
                        help_text=f.help_text,
                    )
                form_cls.base_fields[field_key] = field
                form_cls.declared_fields[field_key] = field

    _fields_registered = True




