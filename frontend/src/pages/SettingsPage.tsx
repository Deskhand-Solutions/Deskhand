import { ShieldCheck } from 'lucide-react'
import { AIConfigPanel } from '../ai'
import { IntegrationsPanel } from '../integrations'
import { PageHeader } from '../shared/components'

export const SettingsPage = () => (
  <div className="space-y-8">
    <PageHeader
      title="Einstellungen"
      description="KI-Anbindung, Integrationen und Organisationseinstellungen."
    />

    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-text">KI-Konfiguration</h2>
        <p className="mt-1 text-sm text-muted">
          Hinterlegte KI-Anbieter (maskiert) und welche KI jedes Modul nutzt —
          gilt für alle Mitglieder dieser Organisation.
        </p>
      </div>
      <AIConfigPanel />
    </section>

    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-text">Integrationen</h2>
        <p className="mt-1 text-sm text-muted">
          Externe Dienste, die für Ihre Organisation eingerichtet sind — alle
          Module nutzen dieselbe Anbindung.
        </p>
      </div>
      <IntegrationsPanel />
    </section>

    <section className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-soft">
      <ShieldCheck
        className="mt-0.5 size-4 shrink-0 text-muted-soft"
        strokeWidth={1.75}
        aria-hidden
      />
      API-Schlüssel und Integrationen werden zentral vom Deskhand-Team
      eingerichtet und verschlüsselt gespeichert. Hier sehen Sie den aktuellen
      Stand für Ihre Organisation.
    </section>
  </div>
)
