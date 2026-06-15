import { FileCode, AlertCircle } from 'lucide-react'

type HtmlEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
}

export const HtmlEditor = ({
  value,
  onChange,
  label = 'HTML-Code',
}: HtmlEditorProps) => {
  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* Editor Header Tab */}
      <div className="flex items-center justify-between bg-surface-elevated border border-border border-b-0 rounded-t-xl px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="size-4 text-accent" />
          <span className="text-xs font-semibold text-text">{label}</span>
          <span className="inline-flex items-center rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
            email_template.html
          </span>
        </div>
        <span className="text-[10px] text-muted-soft">UTF-8</span>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 relative min-h-[380px]">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="w-full h-full min-h-[380px] rounded-b-xl border border-border border-t-0 bg-field p-4 font-mono text-xs leading-relaxed text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
          placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <!-- Dein E-Mail-Code hier -->&#10;  </body>&#10;</html>"
        />
      </div>

      {/* Warning Alert */}
      <div className="flex items-start gap-2.5 rounded-lg bg-warning-soft/40 border border-warning/10 p-3 text-xs text-warning mt-1">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Direkte Code-Änderung</p>
          <p className="text-muted mt-0.5">
            Manuelle HTML-Änderungen werden nicht in das KI-Briefing zurückgespeichert. Drücke unten auf „Speichern“, um deinen bearbeiteten HTML-Stand zu sichern.
          </p>
        </div>
      </div>
    </div>
  )
}

