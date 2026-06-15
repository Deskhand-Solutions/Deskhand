import { apiRequestValidated } from './client'
import {
  moduleCatalogSchema,
  organizationModulesSchema,
} from '../schemas/module'

export const fetchModuleCatalog = () =>
  apiRequestValidated('/api/v1/modules/', moduleCatalogSchema)

export const fetchOrganizationModules = (organizationSlug: string) =>
  apiRequestValidated(
    `/api/v1/modules/organizations/${organizationSlug}/`,
    organizationModulesSchema,
  )
