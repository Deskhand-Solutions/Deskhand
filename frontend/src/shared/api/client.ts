import type { ZodType } from 'zod'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  organizationSlug?: string | null
  csrf?: boolean
  /** Bei false: kein Token-Refresh bei 401 (schneller Session-Check für Gäste). */
  retryOn401?: boolean
}

const getOrganizationSlug = (): string | null =>
  localStorage.getItem('deskhand_organization_slug')

export const setOrganizationSlug = (slug: string): void => {
  localStorage.setItem('deskhand_organization_slug', slug)
}

export const clearOrganizationSlug = (): void => {
  localStorage.removeItem('deskhand_organization_slug')
}

const getCsrfToken = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

let csrfBootstrapPromise: Promise<void> | null = null

export const ensureCsrfToken = async (): Promise<void> => {
  if (getCsrfToken()) return

  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = fetch(`${API_BASE}/api/v1/auth/csrf/`, {
      credentials: 'include',
    }).then(() => undefined)
  }

  await csrfBootstrapPromise
}

let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      await ensureCsrfToken()
      const csrfToken = getCsrfToken()

      const response = await fetch(`${API_BASE}/api/v1/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({}),
      })

      return response.ok
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

const buildHeaders = (
  options: RequestOptions,
  csrfToken: string | null,
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const orgSlug = options.organizationSlug ?? getOrganizationSlug()
  if (orgSlug) headers['X-Organization-Slug'] = orgSlug

  const method = options.method ?? 'GET'
  const needsCsrf = options.csrf !== false && method !== 'GET'

  if (needsCsrf && csrfToken) {
    headers['X-CSRFToken'] = csrfToken
  }

  return headers
}

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const method = options.method ?? 'GET'
  if (method !== 'GET' && options.csrf !== false) {
    await ensureCsrfToken()
  }

  const csrfToken = getCsrfToken()

  const execute = async (): Promise<Response> =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(options, csrfToken),
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

  let response = await execute()

  if (
    response.status === 401 &&
    options.auth !== false &&
    options.retryOn401 !== false
  ) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await execute()
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const detail =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'detail' in errorBody &&
      typeof errorBody.detail === 'string'
        ? errorBody.detail
        : `API-Fehler: ${response.status}`
    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiRequestValidated = async <T>(
  path: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> => {
  const data = await apiRequest<unknown>(path, options)
  return schema.parse(data)
}
