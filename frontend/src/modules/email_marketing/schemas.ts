import { z } from 'zod'

export const emailProjectStatusSchema = z.enum(['draft', 'generated'])

export const emailImageAssetSchema = z.object({
  id: z.string().uuid(),
  alt_text: z.string(),
  data_url: z.string(),
})

export const emailProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subject_line: z.string(),
  context: z.string(),
  style_guidelines: z.string(),
  html_content: z.string(),
  image_assets: z.array(emailImageAssetSchema),
  status: emailProjectStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export const createEmailProjectSchema = z.object({
  title: z.string().min(1).max(255),
  context: z.string().optional(),
  style_guidelines: z.string().optional(),
  subject_line: z.string().optional(),
  image_assets: z.array(emailImageAssetSchema).optional(),
})

export const updateEmailProjectSchema = createEmailProjectSchema
  .extend({
    html_content: z.string().optional(),
  })
  .partial()

export type EmailProject = z.infer<typeof emailProjectSchema>
export type EmailImageAsset = z.infer<typeof emailImageAssetSchema>
export type CreateEmailProjectInput = z.infer<typeof createEmailProjectSchema>
export type UpdateEmailProjectInput = z.infer<typeof updateEmailProjectSchema>
