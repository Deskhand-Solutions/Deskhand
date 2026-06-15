import type { z } from 'zod'
import type {
  healthResponseSchema,
  platformInfoResponseSchema,
} from '../schemas/health'

export type HealthResponse = z.infer<typeof healthResponseSchema>
export type PlatformInfoResponse = z.infer<typeof platformInfoResponseSchema>
