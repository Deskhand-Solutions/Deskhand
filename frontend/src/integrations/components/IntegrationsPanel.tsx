import { useState } from 'react'
import {
  Button,
  ErrorAlert,
  Input,
  LoadingState,
  Modal,
  useToast,
} from '../../shared/components'
import { useOrganizationIntegrations } from '../hooks/useOrganizationIntegrations'
import { IntegrationCard } from './IntegrationCard'
import type { OrganizationIntegration } from '../schemas'

export const IntegrationsPanel = () => {
  const {
    integrations,
    isLoading,
    error,
    saveConnection,
    isSaving,
    disconnectConnection,
    isDisconnecting,
  } = useOrganizationIntegrations()

  const { showToast } = useToast()
  const [activeSetup, setActiveSetup] = useState<OrganizationIntegration | null>(null)
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleOpenSetup = (integration: OrganizationIntegration) => {
    setActiveSetup(integration)
    setValidationError(null)
    
    // Prefill formState with empty strings for all expected fields
    const initialForm: Record<string, string> = {}
    integration.credential_fields.forEach((field) => {
      initialForm[field.key] = ''
    })
    setFormState(initialForm)
  }

  const handleInputChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSetup) return

    // Verify all required fields have values
    const missing = activeSetup.credential_fields.filter(
      (field) => !formState[field.key]?.trim()
    )

    // For editing existing connections, we allow secrets to be omitted if they are already masked/filled
    const realMissing = missing.filter((field) => {
      if (field.secret && activeSetup.connected) return false
      return true
    })

    if (realMissing.length > 0) {
      setValidationError(
        `Bitte füllen Sie folgende Felder aus: ${realMissing
          .map((f) => f.label)
          .join(', ')}`
      )
      return
    }

    try {
      setValidationError(null)
      // Keep only non-empty strings (avoid sending empty strings for secrets)
      const cleanCredentials = { ...formState }
      Object.keys(cleanCredentials).forEach((key) => {
        if (!cleanCredentials[key]?.trim()) {
          delete cleanCredentials[key]
        }
      })

      await saveConnection({
        providerSlug: activeSetup.slug,
        credentials: cleanCredentials,
      })
      showToast(`${activeSetup.name} erfolgreich konfiguriert.`, 'success')
      setActiveSetup(null)
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    }
  }

  const handleDisconnect = async (integration: OrganizationIntegration) => {
    if (confirm(`Möchten Sie die Verbindung zu ${integration.name} wirklich trennen?`)) {
      try {
        await disconnectConnection(integration.slug)
        showToast(`Verbindung zu ${integration.name} wurde getrennt.`, 'info')
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Trennen fehlgeschlagen.',
          'error'
        )
      }
    }
  }

  if (isLoading) {
    return <LoadingState message="Integrationen werden geladen…" />
  }

  if (error) {
    return (
      <ErrorAlert
        prefix="Integrationen konnten nicht geladen werden"
        message={error instanceof Error ? error.message : 'Unbekannter Fehler'}
      />
    )
  }

  if (integrations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted shadow-soft">
        Keine Integrationen verfügbar.
      </div>
    )
  }

  const isPending = isSaving || isDisconnecting

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.slug}
            integration={integration}
            onSetup={handleOpenSetup}
            onDisconnect={handleDisconnect}
            isActionPending={isPending}
          />
        ))}
      </div>

      {/* Dynamic Connection Setup Modal */}
      {activeSetup && (
        <Modal
          open={!!activeSetup}
          title={`${activeSetup.name} konfigurieren`}
          onClose={() => {
            if (!isPending) setActiveSetup(null)
          }}
        >
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              Tragen Sie die Zugangsdaten für {activeSetup.name} ein. Diese werden verschlüsselt gespeichert und sind für Ihre Organisation sofort aktiv.
            </p>

            {validationError && <ErrorAlert message={validationError} />}

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {activeSetup.credential_fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Input
                    label={field.label}
                    type={field.secret ? 'password' : 'text'}
                    value={formState[field.key] ?? ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={
                      field.secret && activeSetup.connected
                        ? '•••••••• (Unverändert lassen zum Behalten)'
                        : `Geben Sie ${field.label.toLowerCase()} ein`
                    }
                  />
                  {field.help_text && (
                    <p className="text-[11px] text-muted-soft leading-normal mt-0.5 px-0.5">
                      {field.help_text}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => setActiveSetup(null)}
                className="h-9 text-xs"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-9 text-xs bg-gradient-accent text-white px-4"
              >
                {isSaving ? 'Verbinden…' : 'Speichern'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
