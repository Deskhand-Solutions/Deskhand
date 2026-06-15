from django import forms
from django.contrib import admin

from apps.ai.ai_core.models import (
    AIProviderCredential,
    AIUsageRecord,
    ModuleAIBinding,
)
from shared.security import get_secrets_cipher, key_fingerprint


@admin.register(AIUsageRecord)
class AIUsageRecordAdmin(admin.ModelAdmin):
    list_display = (
        "organization",
        "module_slug",
        "provider",
        "model",
        "tokens_input",
        "tokens_output",
        "created_at",
    )
    list_filter = ("provider", "module_slug")
    search_fields = ("organization__name", "module_slug", "model")


class AIProviderCredentialForm(forms.ModelForm):
    api_key = forms.CharField(
        label="API Key",
        required=False,
        widget=forms.PasswordInput(render_value=False),
        help_text=(
            "Nur ausfüllen, um den Key zu setzen oder zu ersetzen. Wird "
            "verschlüsselt gespeichert und nie im Klartext angezeigt."
        ),
    )

    class Meta:
        model = AIProviderCredential
        fields = ["organization", "provider", "label", "api_key", "base_url", "is_active"]


@admin.register(AIProviderCredential)
class AIProviderCredentialAdmin(admin.ModelAdmin):
    form = AIProviderCredentialForm
    list_display = ("organization", "provider", "masked_key", "is_active", "updated_at")
    list_filter = ("provider", "is_active")
    search_fields = ("organization__name", "provider", "label")
    readonly_fields = ("masked_key", "created_by", "created_at", "updated_at")

    @admin.display(description="Key (maskiert)")
    def masked_key(self, obj: AIProviderCredential) -> str:
        return obj.masked_key or "—"

    def save_model(self, request, obj, form, change) -> None:
        api_key = form.cleaned_data.get("api_key")
        if api_key:
            obj.api_key_encrypted = get_secrets_cipher().encrypt(api_key)
            obj.key_prefix, obj.key_last4 = key_fingerprint(api_key)
        if obj.created_by_id is None:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class ModuleAIBindingForm(forms.ModelForm):
    class Meta:
        model = ModuleAIBinding
        fields = ["organization", "module_slug", "provider", "model"]

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        from apps.core.module_registry.models import Module

        modules = list(Module.objects.filter(is_active=True).order_by("name"))
        if modules:
            self.fields["module_slug"] = forms.ChoiceField(
                label="Modul",
                choices=[(m.slug, f"{m.name} ({m.slug})") for m in modules],
            )


@admin.register(ModuleAIBinding)
class ModuleAIBindingAdmin(admin.ModelAdmin):
    form = ModuleAIBindingForm
    list_display = ("organization", "module_slug", "provider", "model", "updated_at")
    list_filter = ("provider", "module_slug")
    search_fields = ("organization__name", "module_slug", "provider")


# --- Inlines for the per-organization admin page (config in one place) ---------


class AIProviderCredentialInlineForm(forms.ModelForm):
    api_key = forms.CharField(
        label="API Key",
        required=False,
        widget=forms.PasswordInput(render_value=False),
        help_text="Nur ausfüllen, um den Key zu setzen/ersetzen. Verschlüsselt gespeichert.",
    )

    class Meta:
        model = AIProviderCredential
        fields = ["provider", "label", "api_key", "base_url", "is_active"]

    def save(self, commit=True):
        # Inline formsets call save(commit=False); the organization FK is set by
        # the formset afterwards. We only set the encrypted fields here.
        instance = super().save(commit=False)
        api_key = self.cleaned_data.get("api_key")
        if api_key:
            instance.api_key_encrypted = get_secrets_cipher().encrypt(api_key)
            instance.key_prefix, instance.key_last4 = key_fingerprint(api_key)
        if commit:
            instance.save()
        return instance


class AIProviderCredentialInline(admin.StackedInline):
    model = AIProviderCredential
    form = AIProviderCredentialInlineForm
    extra = 0
    fields = ("provider", "label", "api_key", "base_url", "is_active", "current_key")
    readonly_fields = ("current_key",)
    verbose_name = "KI-API-Key"
    verbose_name_plural = "KI-API-Keys (ein Schlüssel je Anbieter)"

    @admin.display(description="Aktueller Key")
    def current_key(self, obj: AIProviderCredential) -> str:
        return obj.masked_key or "—"


class ModuleAIBindingInlineForm(forms.ModelForm):
    class Meta:
        model = ModuleAIBinding
        fields = ["module_slug", "provider", "model"]

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        from apps.core.module_registry.models import Module

        modules = list(Module.objects.filter(is_active=True).order_by("name"))
        if modules:
            self.fields["module_slug"] = forms.ChoiceField(
                label="Modul",
                choices=[(m.slug, f"{m.name} ({m.slug})") for m in modules],
            )


class ModuleAIBindingInline(admin.TabularInline):
    model = ModuleAIBinding
    form = ModuleAIBindingInlineForm
    extra = 0
    fields = ("module_slug", "provider", "model")
    verbose_name = "Modul-KI-Zuordnung"
    verbose_name_plural = "Modul → KI (welches Modul welche KI nutzt)"
