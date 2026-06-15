import { MailOpen } from 'lucide-react'
import type { EmailImageAsset } from '../schemas'

type EmailPreviewProps = {
  htmlContent: string
  viewport: 'desktop' | 'mobile'
  subjectLine?: string
  images?: EmailImageAsset[]
}

export const EmailPreview = ({
  htmlContent,
  viewport,
  subjectLine,
  images = [],
}: EmailPreviewProps) => {
  if (!htmlContent.trim()) {
    return (
      <div className="flex flex-col flex-1 min-h-[480px] items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted p-8 text-center animate-fade-in">
        <div className="rounded-full bg-surface-elevated border border-border p-4 text-muted mb-3">
          <MailOpen className="size-6 text-muted-soft" />
        </div>
        <h4 className="text-sm font-semibold text-text">Keine Vorschau verfügbar</h4>
        <p className="max-w-xs text-xs leading-relaxed text-muted mt-1">
          Die Vorschau erscheint hier, sobald du eine E-Mail generiert oder HTML-Code eingefügt hast.
        </p>
      </div>
    )
  }

  // Replace placeholder URLs with local blob URLs for live preview
  let displayHtml = htmlContent
  images.forEach((img) => {
    if (img.data_url.startsWith('blob:')) {
      const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(img.alt_text)}`
      // Escape for regex
      const escapedUrl = placeholderUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      displayHtml = displayHtml.replace(new RegExp(escapedUrl, 'g'), img.data_url)
    }
  })

  if (viewport === 'mobile') {
    return (
      <div className="flex justify-center py-2 animate-fade-in">
        {/* Mock Smartphone Chassis */}
        <div className="relative mx-auto border-8 border-surface-elevated rounded-[40px] bg-canvas shadow-elevated w-[320px] h-[560px] overflow-hidden flex flex-col transition-all duration-300">
          {/* Speaker Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-surface-elevated rounded-full z-10 flex items-center justify-center">
            <div className="w-6 h-1 bg-border rounded-full" />
          </div>

          {/* Smartphone Status Bar Area */}
          <div className="bg-surface h-7 shrink-0" />

          {/* Client Header inside phone */}
          <div className="bg-surface px-3 pb-2 border-b border-border/40 text-[9px] text-muted space-y-0.5">
            <div className="truncate">
              <span className="font-semibold text-text">Von:</span> Deskhand AI &lt;ai@deskhand.io&gt;
            </div>
            <div className="truncate">
              <span className="font-semibold text-text">Betreff:</span> {subjectLine || '(Keine Betreffzeile)'}
            </div>
          </div>

          {/* Mobile Iframe */}
          <div className="flex-1 bg-white overflow-hidden relative">
            <iframe
              title="E-Mail-Vorschau Mobil"
              srcDoc={displayHtml}
              className="w-full h-full border-none bg-white"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    )
  }

  // Desktop viewport
  return (
    <div className="w-full flex-1 flex flex-col rounded-xl border border-border bg-canvas shadow-soft overflow-hidden transition-all duration-300 animate-fade-in">
      {/* Browser mockup header */}
      <div className="bg-surface-elevated border-b border-border px-4 py-2 flex items-center gap-2 shrink-0">
        <div className="flex gap-1.5 shrink-0">
          <span className="size-2.5 rounded-full bg-error/30" />
          <span className="size-2.5 rounded-full bg-warning/30" />
          <span className="size-2.5 rounded-full bg-success/30" />
        </div>
        <div className="bg-field border border-border/80 rounded-md text-[10px] text-muted-soft text-center py-0.5 px-3 flex-1 max-w-md mx-auto truncate flex items-center justify-center gap-1">
          <span>https://deskhand.io/preview/email_marketing</span>
        </div>
      </div>

      {/* Desktop Email client header */}
      <div className="bg-surface px-6 py-4 border-b border-border text-[11px] text-muted space-y-1 bg-gradient-to-b from-surface to-canvas shrink-0">
        <div>
          <span className="font-semibold text-text w-14 inline-block">Von:</span>
          <span className="text-text font-medium">Deskhand AI</span> &lt;ai@deskhand.io&gt;
        </div>
        <div>
          <span className="font-semibold text-text w-14 inline-block">An:</span>
          Kunde &lt;empfaenger@beispiel.de&gt;
        </div>
        <div className="truncate">
          <span className="font-semibold text-text w-14 inline-block">Betreff:</span>
          <span className="font-medium text-text">{subjectLine || '(Keine Betreffzeile)'}</span>
        </div>
      </div>

      {/* Desktop Iframe container */}
      <div className="flex-1 bg-white min-h-[480px] relative">
        <iframe
          title="E-Mail-Vorschau Desktop"
          srcDoc={displayHtml}
          className="w-full h-full min-h-[480px] border-none bg-white"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}
