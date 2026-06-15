import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  ErrorAlert,
  LoadingState,
  PageHeader,
  StatusBadge,
} from '../shared/components'
import { useHealth, usePlatformInfo } from '../shared/hooks/useHealth'

export const HomePage = () => {
  const queryClient = useQueryClient()
  const healthQuery = useHealth()
  const platformQuery = usePlatformInfo()

  const isLoading = healthQuery.isLoading || platformQuery.isLoading
  const error = healthQuery.error ?? platformQuery.error

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['health'] })
    void queryClient.invalidateQueries({ queryKey: ['platform-info'] })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plattform-Startpunkt"
        description="Deskhand ist die Hülle für eure KI-Automatisierungsmodule. Kern-Apps verwalten Mandanten, Abonnements und Modulfreischaltungen."
      />

      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-text">Systemstatus</h3>
            <p className="text-sm text-muted">Backend und Plattform-Metadaten</p>
          </div>
          <Button type="button" onClick={handleRefresh} aria-label="Status aktualisieren">
            Aktualisieren
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading && <LoadingState message="Verbindung wird geprüft …" />}

          {error && (
            <ErrorAlert
              message={error instanceof Error ? error.message : 'Unbekannter Fehler'}
              prefix="Backend nicht erreichbar"
            />
          )}

          {!isLoading && !error && healthQuery.data && platformQuery.data && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge label={healthQuery.data.status} tone="success" />
                <span className="text-sm text-muted">{healthQuery.data.message}</span>
              </div>
              <p className="text-sm text-muted">{platformQuery.data.description}</p>
              <p className="text-xs text-muted">
                Registrierte Code-Plugins:{' '}
                {platformQuery.data.registered_module_plugins.length}
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
