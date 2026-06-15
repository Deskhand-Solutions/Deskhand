import { apiRequestValidated } from '../shared/api/client'
import { aiOverviewSchema, type AIOverview } from './schemas'

/**
 * Read-only AI configuration for the active organization.
 * The organization is resolved server-side from the X-Organization-Slug header.
 */
export const fetchOrganizationAIConfig = (): Promise<AIOverview> =>
  apiRequestValidated('/api/v1/ai/overview/', aiOverviewSchema)
