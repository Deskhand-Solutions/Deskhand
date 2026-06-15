import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useAuth } from '../features/auth/AuthContext'
import { canAccessAdministration } from '../shared/utils/canAccessAdministration'
import { apiRequestValidated } from '../shared/api/client'
import {
  ErrorAlert,
  LoadingState,
  PageHeader,
  StatusBadge,
  Table,
} from '../shared/components'

const auditLogSchema = z.array(
  z.object({
    id: z.string().uuid(),
    action: z.string(),
    resource_type: z.string(),
    resource_id: z.string(),
    user_email: z.string().nullable(),
    created_at: z.string(),
  }),
)

const apiKeySchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    key_prefix: z.string(),
    is_active: z.boolean(),
    last_used_at: z.string().nullable(),
    created_at: z.string(),
  }),
)

export const AdministrationPage = () => {
  const { user } = useAuth()

  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiRequestValidated('/api/v1/audit-logs/', auditLogSchema),
    enabled: Boolean(user),
  })

  const apiKeysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiRequestValidated('/api/v1/api-keys/', apiKeySchema),
    enabled: Boolean(user),
  })

  if (!canAccessAdministration(user)) {
    return (
      <ErrorAlert
        prefix="Zugriff verweigert"
        message="Sie benötigen Administratorrechte für diesen Bereich."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administration"
        description="Benutzer, Module, Audit Logs und API-Schlüssel."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text">Audit Logs</h2>
        {auditQuery.isLoading && <LoadingState message="Audit Logs werden geladen …" />}
        {auditQuery.error && (
          <ErrorAlert
            message={
              auditQuery.error instanceof Error
                ? auditQuery.error.message
                : 'Unbekannter Fehler'
            }
          />
        )}
        {auditQuery.data && (
          <Table
            columns={[
              { key: 'action', header: 'Aktion', render: (row) => row.action },
              { key: 'type', header: 'Ressource', render: (row) => row.resource_type },
              { key: 'user', header: 'Benutzer', render: (row) => row.user_email ?? 'System' },
              {
                key: 'created',
                header: 'Zeit',
                render: (row) => new Date(row.created_at).toLocaleString('de-DE'),
              },
            ]}
            data={auditQuery.data}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text">API-Schlüssel</h2>
        {apiKeysQuery.isLoading && <LoadingState message="API-Schlüssel werden geladen …" />}
        {apiKeysQuery.data && (
          <Table
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'prefix', header: 'Präfix', render: (row) => `${row.key_prefix}…` },
              {
                key: 'active',
                header: 'Status',
                render: (row) => (
                  <StatusBadge
                    label={row.is_active ? 'Aktiv' : 'Inaktiv'}
                    tone={row.is_active ? 'success' : 'neutral'}
                  />
                ),
              },
              {
                key: 'last_used',
                header: 'Zuletzt genutzt',
                render: (row) =>
                  row.last_used_at
                    ? new Date(row.last_used_at).toLocaleString('de-DE')
                    : 'Nie',
              },
            ]}
            data={apiKeysQuery.data}
          />
        )}
      </section>
    </div>
  )
}
