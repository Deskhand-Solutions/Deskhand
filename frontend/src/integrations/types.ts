/**
 * Frontend integration definition — mirrors backend/apps/integrations/providers/<slug>/.
 */
export type IntegrationDefinition = {
  /** Same as backend provider slug, e.g. google */
  slug: string
  name: string
  description: string
  /** Short label for cards, e.g. "G" */
  monogram: string
}

export type { OrganizationIntegration } from './schemas'
