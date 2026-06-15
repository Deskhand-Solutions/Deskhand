import { useState } from 'react'
import {
  Monitor,
  Smartphone,
  Code,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react'
import { Button, Card } from '../../../shared/components'
import { cn } from '../../../shared/utils/cn'
import { EmailPreview } from './EmailPreview'
import { HtmlEditor } from './HtmlEditor'
import type { EmailImageAsset } from '../schemas'

type EmailEditorPanelProps = {
  htmlContent: string
  onHtmlChange: (value: string) => void
  onSaveHtml: () => void
  isSaving: boolean
  canSave: boolean
  subjectLine?: string
  images?: EmailImageAsset[]
  onGenerateRefinement: (prompt: string) => void
  isGenerating: boolean
}

type ViewMode = 'desktop' | 'mobile' | 'code'

export const EmailEditorPanel = ({
  htmlContent,
  onHtmlChange,
  onSaveHtml,
  isSaving,
  canSave,
  subjectLine,
  images = [],
  onGenerateRefinement,
  isGenerating,
}: EmailEditorPanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [copied, setCopied] = useState(false)
  const [refinementPrompt, setRefinementPrompt] = useState('')

  const hasContent = Boolean(htmlContent.trim())

  const handleCopy = async () => {
    if (!hasContent) return
    try {
      await navigator.clipboard.writeText(htmlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Kopieren fehlgeschlagen:', err)
    }
  }

  const handleDownload = () => {
    if (!hasContent) return
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'email_marketing_template.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenNewTab = () => {
    if (!hasContent) return
    const newTab = window.open()
    if (newTab) {
      newTab.document.write(htmlContent)
      newTab.document.close()
    }
  }

  return (
    <Card padding="md" className="flex min-h-[580px] flex-col gap-4">
      {/* Panel Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* View Mode Switcher */}
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-muted p-0.5 border border-border/60">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={cn(
              'flex items-center gap-1.5 h-8 rounded-md px-3 text-xs font-semibold transition-all duration-150 cursor-pointer',
              viewMode === 'desktop'
                ? 'bg-surface text-text shadow-soft'
                : 'text-muted hover:text-text'
            )}
            title="Desktop-Vorschau"
          >
            <Monitor className="size-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={cn(
              'flex items-center gap-1.5 h-8 rounded-md px-3 text-xs font-semibold transition-all duration-150 cursor-pointer',
              viewMode === 'mobile'
                ? 'bg-surface text-text shadow-soft'
                : 'text-muted hover:text-text'
            )}
            title="Mobil-Vorschau"
          >
            <Smartphone className="size-3.5" />
            <span className="hidden md:inline">Mobil</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={cn(
              'flex items-center gap-1.5 h-8 rounded-md px-3 text-xs font-semibold transition-all duration-150 cursor-pointer',
              viewMode === 'code'
                ? 'bg-surface text-text shadow-soft'
                : 'text-muted hover:text-text'
            )}
            title="HTML bearbeiten"
          >
            <Code className="size-3.5" />
            <span className="hidden md:inline">HTML Code</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasContent}
            className="flex items-center justify-center size-8 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-border-strong disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            title="HTML kopieren"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasContent}
            className="flex items-center justify-center size-8 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-border-strong disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            title="HTML herunterladen"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenNewTab}
            disabled={!hasContent}
            className="flex items-center justify-center size-8 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-border-strong disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            title="In neuem Tab öffnen"
          >
            <ExternalLink className="size-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col min-h-[420px]">
        {viewMode !== 'code' ? (
          <EmailPreview
            htmlContent={htmlContent}
            viewport={viewMode}
            subjectLine={subjectLine}
            images={images}
          />
        ) : (
          <div className="flex flex-1 flex-col gap-3 animate-fade-in">
            <HtmlEditor value={htmlContent} onChange={onHtmlChange} />
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveHtml}
              disabled={isSaving || !canSave}
              className="self-end gap-1.5 h-9"
            >
              Speichern
            </Button>
          </div>
        )}
      </div>

      {/* Refinement Prompt (Nachprompten) Section */}
      {hasContent && (
        <div className="border-t border-border pt-4 mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (refinementPrompt.trim() && !isGenerating) {
                onGenerateRefinement(refinementPrompt)
                setRefinementPrompt('')
              }
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-accent-soft text-accent text-[11px] font-bold">
                💡
              </span>
              <span className="text-xs font-semibold text-text">
                E-Mail-Design korrigieren & anpassen (Nachprompten)
              </span>
            </div>
            
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="z. B. 'Färbe den Button rot', 'Schriftgröße erhöhen', 'Tonalität professioneller machen'..."
                disabled={isGenerating}
                className="flex-1 h-9 rounded-lg border border-border bg-field px-3 text-xs text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <Button
                type="submit"
                disabled={isGenerating || !refinementPrompt.trim()}
                className="h-9 px-4 shrink-0 text-xs bg-gradient-accent text-white"
              >
                {isGenerating ? 'Wird angepasst…' : 'Anpassen'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  )
}
