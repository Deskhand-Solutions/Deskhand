import { apiRequestValidated } from './client'
import {
  healthResponseSchema,
  platformInfoResponseSchema,
} from '../schemas/health'

export const fetchHealth = () =>
  apiRequestValidated('/api/health/', healthResponseSchema)

export const fetchPlatformInfo = () =>
  apiRequestValidated('/api/platform/', platformInfoResponseSchema)
