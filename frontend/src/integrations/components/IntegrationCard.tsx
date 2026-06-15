import { Button, Card, StatusBadge } from '../../shared/components'
import { getIntegrationMonogram } from '../registry'
import type { OrganizationIntegration } from '../schemas'

type IntegrationCardProps = {
  integration: OrganizationIntegration
  onSetup: (integration: OrganizationIntegration) => void
  onDisconnect: (integration: OrganizationIntegration) => void
  isActionPending?: boolean
}

const statusTone = (
  status: OrganizationIntegration['status'],
): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'connected') return 'success'
  if (status === 'error') return 'error'
  return 'neutral'
}

const statusLabel = (status: OrganizationIntegration['status']): string => {
  if (status === 'connected') return 'Verbunden'
  if (status === 'error') return 'Fehler'
  return 'Nicht verbunden'
}

export const IntegrationCard = ({
  integration,
  onSetup,
  onDisconnect,
  isActionPending = false,
}: IntegrationCardProps) => (
  <Card className="flex flex-col justify-between gap-4">
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-[13px] font-semibold text-text"
            aria-hidden
          >
            {getIntegrationMonogram(integration.slug)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text">{integration.name}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {integration.description}
            </p>
          </div>
        </div>
        <StatusBadge
          label={statusLabel(integration.status)}
          tone={statusTone(integration.status)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3.5 text-[13px]">
        {integration.connected && integration.masked_credential ? (
          <span className="text-muted">
            Zugang:{' '}
            <span className="font-mono text-text">
              {integration.masked_credential}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            {integration.connected ? 'Verbunden' : 'Nicht eingerichtet'}
          </span>
        )}
        <span className="text-xs text-muted-soft">Verwaltet von Deskhand</span>
      </div>
    </div>

    <div className="flex items-center gap-2 border-t border-border pt-3.5 mt-auto">
      {integration.connected ? (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSetup(integration)}
            disabled={isActionPending}
            className="h-8 text-xs px-3"
          >
            Bearbeiten
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onDisconnect(integration)}
            disabled={isActionPending}
            className="h-8 text-xs px-3 text-error hover:bg-error-soft hover:text-error"
          >
            Trennen
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={() => onSetup(integration)}
          disabled={isActionPending}
          className="h-8 text-xs px-4 bg-gradient-accent text-white"
        >
          Einrichten
        </Button>
      )}
    </div>
  </Card>
)
