import { useParams } from 'react-router-dom'
import {
  ButtonLink,
  Card,
  ErrorAlert,
  LoadingState,
  PageHeader,
} from '../shared/components'
import { useEnabledModules } from '../shared/hooks/useEnabledModules'
import { getModuleBySlug } from './registry'

export const ModuleRoutePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const { modules, isLoading, error } = useEnabledModules()
  const module = slug ? getModuleBySlug(slug) : undefined
  const isEnabledForOrg =
    Boolean(slug) && modules.some((item) => item.module.slug === slug && item.enabled)

  if (isLoading) {
    return <LoadingState message="Modulzugriff wird geprüft…" />
  }

  if (error) {
    return (
      <ErrorAlert
        prefix="Modulzugriff konnte nicht geprüft werden"
        message={error instanceof Error ? error.message : 'Unbekannter Fehler'}
      />
    )
  }

  if (isEnabledForOrg && !module) {
    const enabledModule = modules.find((item) => item.module.slug === slug)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modul-Oberfläche in Arbeit"
          description={`„${enabledModule?.module.name ?? slug}“ ist für deine Organisation aktiv, die UI wird noch implementiert.`}
        />
        <Card padding="md">
          <p className="text-sm text-muted">
            Backend und Freischaltung sind bereit. Die Oberfläche folgt unter{' '}
            <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-xs text-text">frontend/src/modules/{slug}/</code>.
          </p>
          <div className="mt-4">
            <ButtonLink to="/modules" variant="secondary">
              Zur Modul-Übersicht
            </ButtonLink>
          </div>
        </Card>
      </div>
    )
  }

  if (module && slug && !isEnabledForOrg) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modul nicht freigeschaltet"
          description={`„${module.name}“ ist für deine Organisation nicht aktiviert.`}
        />
        <Card padding="md">
          <ButtonLink to="/modules" variant="secondary">
            Zur Modul-Übersicht
          </ButtonLink>
        </Card>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modul nicht gefunden"
          description={
            slug
              ? `Für „${slug}“ gibt es noch keine Oberfläche in src/modules/.`
              : 'Kein Modul-Slug in der URL.'
          }
        />
        <Card padding="md">
          <p className="text-sm text-muted">
            Modul-UI liegt unter{' '}
            <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-xs text-text">frontend/src/modules/&lt;name&gt;/</code> — analog
            zu{' '}
            <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-xs text-text">backend/apps/modules/&lt;name&gt;/</code>.
          </p>
          <div className="mt-4">
            <ButtonLink to="/modules" variant="secondary">
              Zur Modul-Übersicht
            </ButtonLink>
          </div>
        </Card>
      </div>
    )
  }

  const { Page } = module
  return <Page />
}
