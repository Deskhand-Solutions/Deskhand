import { Card, ErrorAlert, LoadingState } from '../../shared/components'
import { useDashboardStats } from '../../shared/hooks/useDashboardStats'

const formatActivityTime = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const RecentActivitiesWidget = () => {
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <Card padding="none" aria-labelledby="activity-heading" className="h-full">
        <div className="border-b border-border px-5 py-3.5">
          <h2 id="activity-heading" className="text-sm font-semibold text-text">
            Letzte Aktivitäten
          </h2>
        </div>
        <div className="p-5">
          <LoadingState message="Aktivitäten werden geladen …" />
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <ErrorAlert
        message={
          error instanceof Error
            ? error.message
            : 'Aktivitäten konnten nicht geladen werden.'
        }
      />
    )
  }

  const activities = data.recent_activities

  return (
    <Card padding="none" aria-labelledby="activity-heading" className="h-full">
      <div className="border-b border-border px-5 py-3.5">
        <h2 id="activity-heading" className="text-sm font-semibold text-text">
          Letzte Aktivitäten
        </h2>
      </div>
      <div className="px-5 py-2">
        {activities.length === 0 ? (
          <p className="py-3 text-sm text-muted">
            Noch keine Aktivitäten erfasst.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {activities.slice(0, 8).map((activity) => (
              <li
                key={activity.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-text">{activity.action}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {activity.resource_type}
                    {activity.user__email ? ` · ${activity.user__email}` : ''}
                  </p>
                </div>
                <time
                  dateTime={activity.created_at}
                  className="shrink-0 text-xs text-muted-soft tabular-nums"
                >
                  {formatActivityTime(activity.created_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
