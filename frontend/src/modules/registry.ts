import type { ModuleDefinition } from './types'
import { emailMarketingModule } from './email_marketing'

/**
 * Central registry for automation module pages.
 * Add new modules here after creating frontend/src/modules/<name>/.
 */
export const MODULE_REGISTRY: ModuleDefinition[] = [emailMarketingModule]

export const getModuleBySlug = (slug: string): ModuleDefinition | undefined =>
  MODULE_REGISTRY.find((module) => module.slug === slug)

export const getModuleSlugs = (): string[] =>
  MODULE_REGISTRY.map((module) => module.slug)
