import { Sparkles, Palette, FileText, ImageIcon, Save } from 'lucide-react'
import { Button, Input } from '../../../shared/components'
import type { EmailImageAsset } from '../schemas'
import { ImageUploader } from './ImageUploader'

type EmailBuilderFormProps = {
  title: string
  subjectLine: string
  context: string
  styleGuidelines: string
  images: EmailImageAsset[]
  onTitleChange: (value: string) => void
  onSubjectLineChange: (value: string) => void
  onContextChange: (value: string) => void
  onStyleGuidelinesChange: (value: string) => void
  onImagesChange: (images: EmailImageAsset[]) => void
  onSave: () => void
  onGenerate: () => void
  isSaving?: boolean
  isGenerating?: boolean
}

const textareaClassName =
  'w-full rounded-lg border border-border bg-field px-3 py-2 text-sm text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20'

const CONTEXT_TEMPLATES = [
  {
    name: 'Newsletter',
    text: 'Zielgruppe: Alle Abonnenten\nMehrwert: 3 wertvolle Tipps für produktiveres Arbeiten & Hinweis auf neuen Blogartikel.\nTonalität: Freundlich, inspirierend.\nCall to Action: Blogartikel lesen',
  },
  {
    name: 'Produkt-Launch',
    text: 'Produktname: Deskhand Automations-Modul\nZielgruppe: Entscheider\nHauptnutzen: DSGVO-konform, KI-betrieben, einfache CRM-Integration.\nCall to Action: Kostenfreie Demo vereinbaren',
  },
  {
    name: 'Aktion / Rabatt',
    text: 'Anlass: Summer Sale\nRabatt: 20% auf alle Tarife\nGutscheincode: SUMMER20\nGültigkeit: Bis 31. August\nCall to Action: Gutschein einlösen',
  },
]

const STYLE_PRESETS = [
  {
    name: 'Modern Light',
    text: 'Minimalistisch, helle Farben, viel Weißraum, blaue Akzentknöpfe (#3b82f6), serifenlose Schrift, zentriertes Logo, einspaltig.',
  },
  {
    name: 'Elegant Dark',
    text: 'Edler Dark Mode, anthrazit Hintergrund (#111827), hellgrauer Text, violette Akzentknöpfe (#8b5cf6), feine Begrenzungslinien.',
  },
  {
    name: 'Warm & Cozy',
    text: 'Naturtöne, warmer elfenbeinfarbener Hintergrund (#fafaf9), dunkelbraune Schrift, olivgrüne Akzentknöpfe (#15803d), runde Ecken.',
  },
]

export const EmailBuilderForm = ({
  title,
  subjectLine,
  context,
  styleGuidelines,
  images,
  onTitleChange,
  onSubjectLineChange,
  onContextChange,
  onStyleGuidelinesChange,
  onImagesChange,
  onSave,
  onGenerate,
  isSaving = false,
  isGenerating = false,
}: EmailBuilderFormProps) => (
  <div className="space-y-6 animate-fade-in">
    {/* Section 1: Basis-Daten */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <FileText className="size-4 text-accent" />
        <h3 className="text-sm font-semibold text-text">1. Basis-Informationen</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Projektname"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="z. B. Launch Newsletter Q2"
        />
        <Input
          label="Betreffzeile"
          value={subjectLine}
          onChange={(event) => onSubjectLineChange(event.target.value)}
          placeholder="Kurzer, klickstarker Betreff"
        />
      </div>
    </div>

    {/* Section 2: Briefing */}
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h3 className="text-sm font-semibold text-text">2. Inhalt & KI-Briefing</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONTEXT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => onContextChange(tmpl.text)}
              className="rounded-md bg-surface-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted hover:border-accent hover:text-accent hover:bg-accent-soft/30 transition-all duration-150 cursor-pointer"
            >
              + {tmpl.name}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <textarea
          value={context}
          onChange={(event) => onContextChange(event.target.value)}
          rows={5}
          className={textareaClassName}
          placeholder="Was soll die E-Mail vermitteln? Zielgruppe, Angebot, USPs, Call to Action..."
        />
      </label>
    </div>

    {/* Section 3: Branding */}
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-accent" />
          <h3 className="text-sm font-semibold text-text">3. Stil & Branding</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onStyleGuidelinesChange(preset.text)}
              className="rounded-md bg-surface-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted hover:border-accent hover:text-accent hover:bg-accent-soft/30 transition-all duration-150 cursor-pointer"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <textarea
          value={styleGuidelines}
          onChange={(event) => onStyleGuidelinesChange(event.target.value)}
          rows={3}
          className={textareaClassName}
          placeholder="Farben, Tonalität, spezielle Layout-Wünsche..."
        />
      </label>
    </div>

    {/* Section 4: Bilder */}
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <ImageIcon className="size-4 text-accent" />
        <h3 className="text-sm font-semibold text-text">4. Bild-Ressourcen</h3>
      </div>
      <ImageUploader images={images} onChange={onImagesChange} />
    </div>

    {/* Actions */}
    <div className="flex flex-wrap gap-3 border-t border-border pt-4 mt-6">
      <Button
        type="button"
        variant="secondary"
        onClick={onSave}
        disabled={isSaving}
        className="gap-1.5 h-10 px-4"
      >
        <Save className="size-4 text-muted" />
        {isSaving ? 'Speichern…' : 'Speichern'}
      </Button>
      <Button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !context.trim()}
        className="gap-2 bg-gradient-accent text-white h-10 px-4 shadow-md hover:shadow-lg transition-all"
      >
        <Sparkles className="size-4 text-white animate-pulse" strokeWidth={1.75} aria-hidden />
        {isGenerating ? 'KI generiert…' : 'Mit KI generieren'}
      </Button>
    </div>
  </div>
)

