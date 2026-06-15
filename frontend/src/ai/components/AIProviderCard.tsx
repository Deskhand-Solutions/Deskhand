import { Card, StatusBadge } from '../../shared/components'
import type { AIProviderOverview } from '../schemas'

type StatusTone = 'success' | 'warning' | 'neutral'

const statusFor = (
  provider: AIProviderOverview,
): { label: string; tone: StatusTone } => {
  if (!provider.configured) return { label: 'Nicht hinterlegt', tone: 'neutral' }
  if (!provider.is_active) return { label: 'Inaktiv', tone: 'warning' }
  return { label: 'Aktiv', tone: 'success' }
}

export const AIProviderCard = ({
  provider,
}: {
  provider: AIProviderOverview
}) => {
  const status = statusFor(provider)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">{provider.name}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {provider.description}
          </p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>

      <dl className="space-y-1.5 border-t border-border pt-3 text-[13px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">API-Key</dt>
          <dd className="font-mono font-medium text-text">
            {provider.configured ? provider.masked_key || '••••••••' : '—'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Standardmodell</dt>
          <dd className="font-medium text-text">{provider.default_model || '—'}</dd>
        </div>
      </dl>
    </Card>
  )
}
