import { ErrorAlert, LoadingState } from '../../shared/components'
import { useOrganizationAIConfig } from '../hooks/useOrganizationAIConfig'
import { AIProviderCard } from './AIProviderCard'
import { ModuleRoutingList } from './ModuleRoutingList'

export const AIConfigPanel = () => {
  const { providers, moduleBindings, isLoading, error } = useOrganizationAIConfig()

  if (isLoading) {
    return <LoadingState message="KI-Konfiguration wird geladen…" />
  }

  if (error) {
    return (
      <ErrorAlert
        prefix="KI-Konfiguration konnte nicht geladen werden"
        message={error instanceof Error ? error.message : 'Unbekannter Fehler'}
      />
    )
  }

  // API-key providers only (the local fallback needs no key).
  const keyProviders = providers.filter((provider) => provider.requires_api_key)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold text-muted">KI-Anbieter</h3>
        {keyProviders.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-soft">
            Keine KI-Anbieter verfügbar.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {keyProviders.map((provider) => (
              <AIProviderCard key={provider.slug} provider={provider} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold text-muted">Modul-Zuordnung</h3>
        <ModuleRoutingList bindings={moduleBindings} />
      </div>
    </div>
  )
}
