import { ButtonLink, Card, LoadingState } from '../../shared/components'
import { useEnabledModules } from '../../shared/hooks/useEnabledModules'

export const EnabledModulesWidget = () => {
  const { modules, isLoading: modulesLoading } = useEnabledModules()

  return (
    <Card padding="none" aria-labelledby="modules-heading" className="h-full">
      <div className="border-b border-border px-5 py-3.5">
        <h2 id="modules-heading" className="text-sm font-semibold text-text">
          Freigeschaltete Module
        </h2>
      </div>
      <div className="px-5 py-2">
        {modulesLoading ? (
          <div className="py-3">
            <LoadingState message="Module werden geladen …" />
          </div>
        ) : modules.length === 0 ? (
          <p className="py-3 text-sm text-muted">
            Noch keine Module freigeschaltet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {modules.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {item.module.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {item.module.description}
                  </p>
                </div>
                <ButtonLink
                  to={`/modules/${item.module.slug}`}
                  variant="ghost"
                  className="h-8 shrink-0 px-2.5 text-[13px]"
                >
                  Öffnen
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
