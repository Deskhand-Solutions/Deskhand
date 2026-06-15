import { z } from 'zod'

export const moduleCatalogItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  version: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.number(),
})

export const organizationModuleItemSchema = z.object({
  id: z.number(),
  module: moduleCatalogItemSchema,
  enabled: z.boolean(),
  enabled_at: z.string(),
  config: z.record(z.string(), z.unknown()),
})

export const moduleCatalogSchema = z.array(moduleCatalogItemSchema)
export const organizationModulesSchema = z.array(organizationModuleItemSchema)
