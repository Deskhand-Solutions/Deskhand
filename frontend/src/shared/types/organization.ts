import type { z } from 'zod'
import type { organizationSchema } from '../schemas/organization'

export type Organization = z.infer<typeof organizationSchema>
