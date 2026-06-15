import { apiRequest, apiRequestValidated } from '../../shared/api/client'
import {
  authResponseSchema,
  organizationsResponseSchema,
  userSchema,
  type User,
} from './schemas'

export const login = async (email: string, password: string) =>
  apiRequestValidated('/api/v1/auth/login/', authResponseSchema, {
    method: 'POST',
    body: { email, password },
    auth: false,
  })

export const register = async (payload: {
  email: string
  password: string
  first_name: string
  last_name: string
  organization_name?: string
}) =>
  apiRequestValidated('/api/v1/auth/register/', authResponseSchema, {
    method: 'POST',
    body: payload,
    auth: false,
  })

export const logout = async () => {
  await apiRequest('/api/v1/auth/logout/', {
    method: 'POST',
    body: {},
  }).catch(() => undefined)
}

export const fetchMe = async (): Promise<User> =>
  apiRequestValidated('/api/v1/auth/me/', userSchema)

export const probeSession = async (): Promise<User | null> => {
  try {
    return await apiRequestValidated('/api/v1/auth/me/', userSchema, {
      retryOn401: false,
    })
  } catch {
    return null
  }
}

export const fetchMyOrganizations = async () =>
  apiRequestValidated(
    '/api/v1/organizations/mine/',
    organizationsResponseSchema,
  )

export const requestPasswordReset = async (email: string) =>
  apiRequest('/api/v1/auth/password/forgot/', {
    method: 'POST',
    body: { email },
    auth: false,
  })

export const resetPassword = async (payload: {
  uid: string
  token: string
  new_password: string
}) =>
  apiRequest('/api/v1/auth/password/reset/', {
    method: 'POST',
    body: payload,
    auth: false,
  })

export const changePassword = async (payload: {
  current_password: string
  new_password: string
}) =>
  apiRequest('/api/v1/auth/password/change/', {
    method: 'POST',
    body: payload,
  })
