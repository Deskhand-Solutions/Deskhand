import { Activity, Cpu, Package, Users } from 'lucide-react'
import {
  ErrorAlert,
  LoadingState,
  StatCard,
} from '../../shared/components'
import { useDashboardStats } from '../../shared/hooks/useDashboardStats'

const formatNumber = (value: number) => value.toLocaleString('de-DE')

export const StatsWidget = () => {
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="py-6">
        <LoadingState message="Statistiken werden geladen …" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <ErrorAlert
        message={
          error instanceof Error
            ? error.message
            : 'Statistiken konnten nicht geladen werden.'
        }
      />
    )
  }

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 w-full"
      aria-label="Kennzahlen"
    >
      <StatCard
        label="Aktive Module"
        value={formatNumber(data.modules.enabled_count)}
        icon={<Package className="size-4" strokeWidth={1.75} aria-hidden />}
      />
      <StatCard
        label="Mitglieder"
        value={formatNumber(data.members.count)}
        icon={<Users className="size-4" strokeWidth={1.75} aria-hidden />}
      />
      <StatCard
        label="Tokens gesamt"
        value={formatNumber(data.usage.total_tokens)}
        hint="KI-Verbrauch"
        icon={<Cpu className="size-4" strokeWidth={1.75} aria-hidden />}
      />
      <StatCard
        label="KI-Anfragen"
        value={formatNumber(data.usage.total_requests)}
        icon={<Activity className="size-4" strokeWidth={1.75} aria-hidden />}
      />
    </section>
  )
}
