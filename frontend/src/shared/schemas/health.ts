import { z } from 'zod'

export const healthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  service: z.string(),
})

export const platformInfoResponseSchema = z.object({
  platform: z.string(),
  description: z.string(),
  registered_module_plugins: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      frontend_route: z.string(),
    }),
  ),
})
