import { Table } from '../../shared/components'
import type { ModuleBindingOverview } from '../schemas'

export const ModuleRoutingList = ({
  bindings,
}: {
  bindings: ModuleBindingOverview[]
}) => {
  if (bindings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-soft">
        Noch keine Modul-Zuordnung hinterlegt — Module nutzen den
        Standard-Provider.
      </div>
    )
  }

  return (
    <Table
      columns={[
        { key: 'module', header: 'Modul', render: (row) => row.module_slug },
        {
          key: 'provider',
          header: 'KI-Provider',
          render: (row) => row.provider_name,
        },
        { key: 'model', header: 'Modell', render: (row) => row.model || 'Standard' },
      ]}
      data={bindings}
    />
  )
}
