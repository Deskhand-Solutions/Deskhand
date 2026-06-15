import uuid

from apps.ai.ai_core.services import UsageTrackingService
from apps.ai.ai_core.services.html_email_generator import HtmlEmailGeneratorService
from apps.ai.ai_core.services.llm_router import LLMRouter
from apps.modules.email_marketing.models import EmailProject, EmailProjectStatus


class EmailGenerationService:
    def __init__(self, *, organization, llm=None):
        self._organization = organization
        self._llm = llm

    def generate_html(self, project: EmailProject, refinement_prompt: str = None) -> EmailProject:
        # Resolve the LLM client through the central LLMRouter
        llm_client = self._llm or LLMRouter.get_llm_for_module(
            organization=self._organization,
            module_slug="email_marketing",
            fallback_to_local=True
        )

        # Fallback to local HTML generator if it resolves to mock local provider
        if llm_client.provider_name == "local":
            local_generator = HtmlEmailGeneratorService()
            if refinement_prompt:
                prompt = f"REFINEMENT: {refinement_prompt}\nORIGINAL_HTML: {project.html_content or ''}"
            else:
                prompt = self._build_prompt(project)
            response = local_generator.generate(prompt)
        else:
            if refinement_prompt and project.html_content:
                # We have a refinement request! Focus on modifying the existing HTML
                system_prompt = (
                    "Du bist ein professioneller E-Mail-Marketing-Designer. "
                    "Dir liegt ein bestehender HTML-Code einer E-Mail vor. "
                    "Deine Aufgabe ist es, diesen HTML-Code exakt nach den Wünschen des Nutzers anzupassen (Korrekturen vorzunehmen).\n\n"
                    f"Bestehender HTML-Code:\n{project.html_content}\n\n"
                    f"Gewünschte Korrekturen / Nachprompt:\n{refinement_prompt}\n\n"
                    "Technische Richtlinien (Strikte Einhaltung):\n"
                    "- Antworte AUSSCHLIESSLICH mit dem validen, korrigierten HTML-Code (beginnend mit <!DOCTYPE html> und endend mit </html>).\n"
                    "- Nutze KEINEN Markdown-Codeblock (z.B. kein ```html am Anfang oder Ende).\n"
                    "- Verwende AUSSCHLIESSLICH Inline-CSS auf den Elementen (keine <style>-Blöcke im Head).\n"
                    "- Behalte das Grundgerüst, den restlichen Inhalt und das Design bei, sofern nicht explizit anders gefordert."
                )
            else:
                # We have a real AI provider configured! Provide strict HTML formatting instructions
                prompt = self._build_prompt(project)
                system_prompt = (
                    "Du bist ein professioneller E-Mail-Marketing-Designer. "
                    "Erstelle eine conversionstarke, responsive HTML-E-Mail basierend auf folgenden Daten.\n\n"
                    f"{prompt}\n\n"
                    "Technische Richtlinien (Strikte Einhaltung):\n"
                    "- Antworte AUSSCHLIESSLICH mit dem validen HTML-Code (beginnend mit <!DOCTYPE html> und endend mit </html>).\n"
                    "- Nutze KEINEN Markdown-Codeblock (z.B. kein ```html am Anfang oder Ende).\n"
                    "- Verwende AUSSCHLIESSLICH Inline-CSS auf den Elementen (keine <style>-Blöcke im Head, da diese von vielen Mail-Clients gelöscht werden).\n"
                    "- Die E-Mail darf maximal 600px breit sein (Tabelle zentriert mit width=\"100%\" style=\"max-width:600px;\").\n"
                    "- Verwende für Bilder die in IMAGES übergebenen URLs. Bette sie per <img src=\"...\" alt=\"...\" style=\"max-width:100%; height:auto; display:block;\" /> ein.\n"
                    "- Gestalte das Design modern, passend zum angegebenen STYLE, mit ansprechenden Farben, viel Weißraum, klarer Typografie und einem prominenten, gut sichtbaren CTA-Button."
                )
            response = llm_client.generate(system_prompt)

        # Track usage in the database
        UsageTrackingService.track(
            organization=self._organization,
            module_slug="email_marketing",
            provider=llm_client.provider_name,
            model=response.model,
            tokens_input=response.tokens_input,
            tokens_output=response.tokens_output,
        )

        project.html_content = response.content
        project.status = EmailProjectStatus.GENERATED
        if not project.subject_line:
            project.subject_line = project.title
        project.save(
            update_fields=["html_content", "status", "subject_line", "updated_at"],
        )
        return project

    def _build_prompt(self, project: EmailProject) -> str:
        images = self._format_images(project.image_assets)
        return (
            f"SUBJECT: {project.subject_line or project.title}\n"
            f"CONTEXT: {project.context}\n"
            f"STYLE: {project.style_guidelines}\n"
            f"IMAGES: {images}"
        )

    def _format_images(self, assets: list) -> str:
        if not isinstance(assets, list):
            return ""
        parts: list[str] = []
        for asset in assets[:6]:
            if not isinstance(asset, dict):
                continue
            alt = str(asset.get("alt_text") or "Bild").strip()
            data_url = str(asset.get("data_url") or "").strip()
            if data_url:
                parts.append(f"{alt}|{data_url}")
        return "; ".join(parts)

