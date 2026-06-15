import { z } from 'zod'

export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
})
