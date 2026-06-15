import type { z } from 'zod'
import type {
  moduleCatalogItemSchema,
  organizationModuleItemSchema,
} from '../schemas/module'

export type ModuleCatalogItem = z.infer<typeof moduleCatalogItemSchema>
export type OrganizationModuleItem = z.infer<typeof organizationModuleItemSchema>
