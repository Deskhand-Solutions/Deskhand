import type { ComponentType } from 'react'

/**
 * Frontend module definition — mirrors backend/apps/modules/<name>/.
 * Folder name and slug must match the Django app name (snake_case).
 */
export type ModuleDefinition = {
  /** Same as backend app folder, e.g. email_marketing */
  slug: string
  name: string
  description: string
  Page: ComponentType
}
