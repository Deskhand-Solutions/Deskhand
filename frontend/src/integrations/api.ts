import { apiRequestValidated } from '../shared/api/client'
import {
  integrationCatalogSchema,
  organizationIntegrationsSchema,
  type IntegrationCatalogItem,
  type OrganizationIntegration,
} from './schemas'

const API_PREFIX = '/api/v1/integrations'

export const fetchIntegrationCatalog = (): Promise<IntegrationCatalogItem[]> =>
  apiRequestValidated(`${API_PREFIX}/`, integrationCatalogSchema)

export const fetchOrganizationIntegrations = (
  organizationSlug: string,
): Promise<OrganizationIntegration[]> =>
  apiRequestValidated(
    `${API_PREFIX}/organizations/${organizationSlug}/`,
    organizationIntegrationsSchema,
  )

export const saveOrganizationIntegration = (
  organizationSlug: string,
  providerSlug: string,
  credentials: Record<string, string>,
): Promise<OrganizationIntegration[]> =>
  apiRequestValidated(
    `${API_PREFIX}/organizations/${organizationSlug}/`,
    organizationIntegrationsSchema,
    {
      method: 'POST',
      body: {
        provider_slug: providerSlug,
        credentials,
      },
    },
  )

export const disconnectOrganizationIntegration = (
  organizationSlug: string,
  providerSlug: string,
): Promise<OrganizationIntegration[]> =>
  apiRequestValidated(
    `${API_PREFIX}/organizations/${organizationSlug}/`,
    organizationIntegrationsSchema,
    {
      method: 'POST',
      body: {
        provider_slug: providerSlug,
        disconnect: true,
      },
    },
  )

