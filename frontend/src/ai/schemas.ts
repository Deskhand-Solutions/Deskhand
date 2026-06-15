import { z } from 'zod'

export const aiProviderOverviewSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  requires_api_key: z.boolean(),
  configured: z.boolean(),
  is_active: z.boolean(),
  masked_key: z.string(),
  label: z.string(),
  default_model: z.string(),
  available_models: z.array(z.string()),
})

export const moduleBindingOverviewSchema = z.object({
  module_slug: z.string(),
  provider: z.string(),
  provider_name: z.string(),
  model: z.string(),
})

export const aiOverviewSchema = z.object({
  providers: z.array(aiProviderOverviewSchema),
  module_bindings: z.array(moduleBindingOverviewSchema),
})

export type AIProviderOverview = z.infer<typeof aiProviderOverviewSchema>
export type ModuleBindingOverview = z.infer<typeof moduleBindingOverviewSchema>
export type AIOverview = z.infer<typeof aiOverviewSchema>
