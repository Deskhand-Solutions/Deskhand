import { useMemo, useState } from 'react'
import { Package, Search } from 'lucide-react'
import { getModuleSlugs } from '../modules/registry'
import { Card, ErrorAlert, LoadingState, PageHeader } from '../shared/components'
import { useEnabledModules } from '../shared/hooks/useEnabledModules'
import { useModuleCatalog } from '../shared/hooks/useModuleCatalog'
import {
  buildModuleCatalogView,
  type ModuleCatalogView,
} from '../shared/modules/modulePresentation'
import { cn } from '../shared/utils/cn'
import { ModuleCatalogCard } from '../widgets/ModuleCatalogCard'

type FilterKey = 'Alle' | 'active' | 'available' | string

const matchesFilter = (module: ModuleCatalogView, filter: FilterKey): boolean => {
  if (filter === 'Alle') return true
  if (filter === 'active') return module.status === 'active'
  if (filter === 'available') return module.status === 'available'
  return module.category === filter
}

export const ModulesPage = () => {
  const { catalog, isLoading: isCatalogLoading, error: catalogError } =
    useModuleCatalog()
  const {
    modules: enabledModules,
    isLoading: isEnabledLoading,
    error: enabledError,
  } = useEnabledModules()

  const [activeFilter, setActiveFilter] = useState<FilterKey>('Alle')
  const [searchQuery, setSearchQuery] = useState('')

  const enabledSlugs = useMemo(
    () => new Set(enabledModules.map((item) => item.module.slug)),
    [enabledModules],
  )

  const openableSlugs = useMemo(() => new Set(getModuleSlugs()), [])

  const catalogModules = useMemo(
    () => buildModuleCatalogView(catalog, enabledSlugs, openableSlugs),
    [catalog, enabledSlugs, openableSlugs],
  )

  const categoryFilters = useMemo(() => {
    const categories = Array.from(
      new Set(catalogModules.map((module) => module.category)),
    ).sort((a, b) => a.localeCompare(b, 'de'))
    return categories
  }, [catalogModules])

  const filterTabs = useMemo(
    () => [
      { key: 'Alle' as const, label: 'Alle' },
      { key: 'active' as const, label: 'Aktiv' },
      { key: 'available' as const, label: 'Verfügbar' },
      ...categoryFilters.map((category) => ({ key: category, label: category })),
    ],
    [categoryFilters],
  )

  const counts = useMemo(
    () => ({
      active: catalogModules.filter((module) => module.status === 'active').length,
      available: catalogModules.filter((module) => module.status === 'available')
        .length,
    }),
    [catalogModules],
  )

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return catalogModules.filter((module) => {
      const matchesSearch =
        !query ||
        module.name.toLowerCase().includes(query) ||
        module.description.toLowerCase().includes(query) ||
        module.category.toLowerCase().includes(query)
      return matchesFilter(module, activeFilter) && matchesSearch
    })
  }, [activeFilter, catalogModules, searchQuery])

  if (isCatalogLoading || isEnabledLoading) {
    return <LoadingState message="Module werden geladen…" />
  }

  if (catalogError || enabledError) {
    const message =
      (catalogError instanceof Error && catalogError.message) ||
      (enabledError instanceof Error && enabledError.message) ||
      'Unbekannter Fehler'
    return <ErrorAlert prefix="Module konnten nicht geladen werden" message={message} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module"
        title="Übersicht"
        description={`${counts.active} aktiv · ${counts.available} verfügbar`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-soft"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            aria-label="Module durchsuchen"
            placeholder="Module durchsuchen …"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={cn(
              'h-9 w-full rounded-lg border border-border bg-field pr-3 pl-9 text-sm text-text shadow-soft outline-none transition-[border-color,box-shadow] duration-150',
              'placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20',
            )}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'h-8 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150',
                activeFilter === tab.key
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:bg-surface-muted hover:text-text',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredModules.length === 0 ? (
        <Card className="flex flex-col items-center py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-muted text-muted">
            <Package className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 text-sm text-muted">
            Keine Module für diesen Filter gefunden.
          </p>
        </Card>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map((module) => (
            <ModuleCatalogCard key={module.id} module={module} />
          ))}
        </section>
      )}
    </div>
  )
}
