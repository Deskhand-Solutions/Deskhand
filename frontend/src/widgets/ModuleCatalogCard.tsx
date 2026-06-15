import { ButtonLink, Card } from '../shared/components'
import { getModuleIcon, type ModuleCatalogView } from '../shared/modules/modulePresentation'
import { cn } from '../shared/utils/cn'

const statusLabel: Record<ModuleCatalogView['status'], string> = {
  active: 'Aktiv',
  available: 'Verfügbar',
}

type ModuleCatalogCardProps = {
  module: ModuleCatalogView
}

export const ModuleCatalogCard = ({ module }: ModuleCatalogCardProps) => {
  const Icon = getModuleIcon(module.icon)
  const isActive = module.status === 'active'

  return (
    <Card interactive={module.canOpen} padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
            isActive
              ? 'border-accent/20 bg-accent-soft text-accent'
              : 'border-border bg-surface-muted text-muted',
          )}
          aria-hidden
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
            isActive
              ? 'border-success/20 bg-success-soft text-success'
              : 'border-border bg-surface-muted text-muted',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              isActive ? 'bg-success' : 'bg-muted-soft',
            )}
            aria-hidden
          />
          {statusLabel[module.status]}
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-text">{module.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {module.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="truncate text-xs text-muted-soft">{module.category}</p>
        {module.canOpen ? (
          <ButtonLink
            to={`/modules/${module.slug}`}
            variant="ghost"
            className="h-7 shrink-0 px-2 text-xs text-accent hover:bg-accent-soft hover:text-accent"
          >
            Öffnen
          </ButtonLink>
        ) : (
          <span className="shrink-0 text-xs text-muted-soft">
            {isActive ? 'Freigegeben' : 'Gesperrt'}
          </span>
        )}
      </div>
    </Card>
  )
}
