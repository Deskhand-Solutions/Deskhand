import { z } from 'zod'

export const credentialFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  secret: z.boolean(),
  help_text: z.string(),
})

export const integrationCatalogItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  auth_type: z.string(),
  required_scopes: z.array(z.string()),
  credential_fields: z.array(credentialFieldSchema),
})

export const organizationIntegrationSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['connected', 'disconnected', 'error']),
  connected: z.boolean(),
  auth_type: z.string(),
  required_scopes: z.array(z.string()),
  credential_fields: z.array(credentialFieldSchema),
  masked_credential: z.string(),
})

export const integrationCatalogSchema = z.array(integrationCatalogItemSchema)
export const organizationIntegrationsSchema = z.array(organizationIntegrationSchema)

export type IntegrationCatalogItem = z.infer<typeof integrationCatalogItemSchema>
export type OrganizationIntegration = z.infer<typeof organizationIntegrationSchema>

