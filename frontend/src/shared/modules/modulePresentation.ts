import {
  Mail,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleCatalogItem } from '../types/module'

const ICON_MAP: Record<string, LucideIcon> = {
  mail: Mail,
}

const CATEGORY_BY_SLUG: Record<string, string> = {
  email_marketing: 'Kommunikation',
}

export type ModuleCatalogStatus = 'active' | 'available'

export type ModuleCatalogView = {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  category: string
  status: ModuleCatalogStatus
  sortOrder: number
  canOpen: boolean
}

export const getModuleIcon = (icon: string): LucideIcon =>
  ICON_MAP[icon] ?? Sparkles

export const getModuleCategory = (slug: string): string =>
  CATEGORY_BY_SLUG[slug] ?? 'Automatisierung'

const compareModules = (a: ModuleCatalogView, b: ModuleCatalogView): number => {
  if (a.status !== b.status) {
    return a.status === 'active' ? -1 : 1
  }
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'de')
}

export const buildModuleCatalogView = (
  catalog: ModuleCatalogItem[],
  enabledSlugs: ReadonlySet<string>,
  openableSlugs: ReadonlySet<string>,
): ModuleCatalogView[] =>
  catalog
    .map((item) => {
      const isActive = enabledSlugs.has(item.slug)
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        icon: item.icon,
        category: getModuleCategory(item.slug),
        status: (isActive ? 'active' : 'available') as ModuleCatalogStatus,
        sortOrder: item.sort_order,
        canOpen: isActive && openableSlugs.has(item.slug),
      }
    })
    .sort(compareModules)
