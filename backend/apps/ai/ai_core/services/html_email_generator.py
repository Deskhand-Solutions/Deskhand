import html
import re
from textwrap import dedent

from apps.ai.ai_core.services.base import BaseLLMService, LLMResponse


class HtmlEmailGeneratorService(BaseLLMService):
    """Builds responsive marketing-email HTML from structured briefs."""

    provider_name = "local"
    model_name = "deskhand-template-v1"

    def generate(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        if prompt.startswith("REFINEMENT:"):
            # parse refinement
            match = re.match(r"^REFINEMENT:\s*(.*?)\s*ORIGINAL_HTML:\s*(.*)$", prompt, re.DOTALL)
            if match:
                refinement = match.group(1)
                orig_html = match.group(2)
                # Inject a notification banner inside orig_html at the start of body
                banner = (
                    f'<div style="background:#fef3c7; border-bottom:1px solid #f59e0b; '
                    f'color:#b45309; padding:12px; text-align:center; font-family:sans-serif; '
                    f'font-size:14px; font-weight:600;">'
                    f'Korrektur angewendet: „{html.escape(refinement)}“'
                    f'</div>'
                )
                
                # Check if there's already a correction banner and replace/remove it to avoid stacking
                orig_html = re.sub(
                    r'<div style="background:#fef3c7;.*?</div>',
                    '',
                    orig_html,
                    flags=re.DOTALL | re.IGNORECASE
                )

                # Find the start of <body> tag
                body_match = re.search(r"<body[^>]*>", orig_html, re.IGNORECASE)
                if body_match:
                    idx = body_match.end()
                    new_content = orig_html[:idx] + "\n" + banner + orig_html[idx:]
                else:
                    new_content = banner + "\n" + orig_html
                
                return LLMResponse(
                    content=new_content,
                    model=model or self.model_name,
                    tokens_input=len(prompt.split()),
                    tokens_output=len(new_content.split()),
                )

        brief = self._parse_brief(prompt)
        content = self._build_html(brief)
        return LLMResponse(
            content=content,
            model=model or self.model_name,
            tokens_input=len(prompt.split()),
            tokens_output=len(content.split()),
        )

    def _parse_brief(self, prompt: str) -> dict:
        sections: dict[str, str] = {
            "context": "",
            "style": "",
            "subject": "",
            "images": "",
        }
        current_key = "context"
        for line in prompt.splitlines():
            stripped = line.strip()
            if stripped.startswith("SUBJECT:"):
                current_key = "subject"
                sections["subject"] = stripped.removeprefix("SUBJECT:").strip()
                continue
            if stripped.startswith("STYLE:"):
                current_key = "style"
                sections["style"] = stripped.removeprefix("STYLE:").strip()
                continue
            if stripped.startswith("IMAGES:"):
                current_key = "images"
                sections["images"] = stripped.removeprefix("IMAGES:").strip()
                continue
            if stripped.startswith("CONTEXT:"):
                current_key = "context"
                sections["context"] = stripped.removeprefix("CONTEXT:").strip()
                continue
            if stripped:
                sections[current_key] = (
                    f"{sections[current_key]}\n{stripped}".strip()
                    if sections[current_key]
                    else stripped
                )
        return sections

    def _extract_accent(self, style: str) -> str:
        hex_match = re.search(r"#(?:[0-9a-fA-F]{3}){1,2}", style)
        if hex_match:
            return hex_match.group(0)
        if "purple" in style.lower() or "violett" in style.lower():
            return "#7c3aed"
        if "green" in style.lower() or "grün" in style.lower():
            return "#059669"
        return "#2563eb"

    def _headline(self, context: str, subject: str) -> str:
        if subject:
            return subject
        first_line = context.split("\n")[0].strip()
        if len(first_line) > 80:
            return first_line[:77] + "..."
        return first_line or "Dein nächstes Highlight"

    def _body_copy(self, context: str) -> str:
        paragraphs = [p.strip() for p in context.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [
                "Entdecke ein Angebot, das zu deinen Zielen passt — klar, modern und überzeugend.",
            ]
        return "".join(
            f'<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">{html.escape(p)}</p>'
            for p in paragraphs[:4]
        )

    def _image_blocks(self, images_raw: str) -> str:
        if not images_raw.strip():
            return ""
        blocks: list[str] = []
        for chunk in images_raw.split(";"):
            chunk = chunk.strip()
            if not chunk:
                continue
            alt = "Marketing visual"
            src = ""
            if "|" in chunk:
                alt_part, src_part = chunk.split("|", 1)
                alt = alt_part.strip() or alt
                src = src_part.strip()
            elif chunk.startswith("http") or chunk.startswith("data:"):
                src = chunk
            if not src:
                continue
            blocks.append(
                dedent(
                    f"""
                    <tr>
                      <td style="padding:0 0 24px;">
                        <img src="{html.escape(src, quote=True)}" alt="{html.escape(alt)}"
                          width="560" style="display:block;width:100%;max-width:560px;border-radius:12px;" />
                      </td>
                    </tr>
                    """
                ).strip(),
            )
        return "\n".join(blocks)

    def _build_html(self, brief: dict) -> str:
        accent = self._extract_accent(brief["style"])
        headline = html.escape(self._headline(brief["context"], brief["subject"]))
        body = self._body_copy(brief["context"])
        images = self._image_blocks(brief["images"])
        tone_hint = html.escape(brief["style"][:120]) if brief["style"] else "Modern & professionell"

        return dedent(
            f"""
            <!DOCTYPE html>
            <html lang="de">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>{headline}</title>
            </head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;">
                <tr>
                  <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0"
                      style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
                      <tr>
                        <td style="background:{accent};padding:28px 32px;">
                          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Marketing Email</p>
                          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.25;color:#ffffff;">{headline}</h1>
                        </td>
                      </tr>
                      {images}
                      <tr>
                        <td style="padding:32px;">
                          {body}
                          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
                            <tr>
                              <td style="border-radius:10px;background:{accent};">
                                <a href="#" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Jetzt entdecken</a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">Stil: {tone_hint}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                            Erstellt mit Deskhand E-Mail-Marketing
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
        ).strip()
