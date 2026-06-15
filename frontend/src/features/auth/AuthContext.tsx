import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearOrganizationSlug,
  ensureCsrfToken,
  setOrganizationSlug,
} from '../../shared/api/client'
import {
  fetchMe,
  fetchMyOrganizations,
  login as loginRequest,
  logout as logoutRequest,
  probeSession,
  register as registerRequest,
} from './api'
import type { Organization, User } from './schemas'

type AuthContextValue = {
  user: User | null
  organizations: Organization[]
  activeOrganization: Organization | null
  /** Session-Check läuft noch (nur geschützte Routen blockieren). */
  isBootstrapping: boolean
  /** @deprecated Alias für isBootstrapping – nur ProtectedRoute nutzen. */
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    password: string
    first_name: string
    last_name: string
    organization_name?: string
  }) => Promise<void>
  logout: () => Promise<void>
  setActiveOrganization: (organization: Organization) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrganization, setActiveOrganizationState] =
    useState<Organization | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const syncOrganizations = useCallback(async () => {
    const orgs = await fetchMyOrganizations()
    setOrganizations(orgs)

    const storedSlug = localStorage.getItem('deskhand_organization_slug')
    const matched = orgs.find((org) => org.slug === storedSlug)
    const next = matched ?? orgs[0] ?? null
    setActiveOrganizationState(next)
    if (next) setOrganizationSlug(next.slug)
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await fetchMe()
    setUser(me)
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [, me] = await Promise.all([ensureCsrfToken(), probeSession()])
        if (me) {
          setUser(me)
          await syncOrganizations()
        } else {
          setUser(null)
          setOrganizations([])
          setActiveOrganizationState(null)
        }
      } catch {
        setUser(null)
        setOrganizations([])
        setActiveOrganizationState(null)
      } finally {
        setIsBootstrapping(false)
      }
    }
    void bootstrap()
  }, [syncOrganizations])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password)
      setUser(data.user)
      await syncOrganizations()
    },
    [syncOrganizations],
  )

  const register = useCallback(
    async (payload: {
      email: string
      password: string
      first_name: string
      last_name: string
      organization_name?: string
    }) => {
      const data = await registerRequest(payload)
      setUser(data.user)
      await syncOrganizations()
    },
    [syncOrganizations],
  )

  const logout = useCallback(async () => {
    await logoutRequest()
    clearOrganizationSlug()
    setUser(null)
    setOrganizations([])
    setActiveOrganizationState(null)
  }, [])

  const setActiveOrganization = useCallback((organization: Organization) => {
    setActiveOrganizationState(organization)
    setOrganizationSlug(organization.slug)
  }, [])

  const value = useMemo(
    () => ({
      user,
      organizations,
      activeOrganization,
      isBootstrapping,
      isLoading: isBootstrapping,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setActiveOrganization,
      refreshUser,
    }),
    [
      user,
      organizations,
      activeOrganization,
      isBootstrapping,
      login,
      register,
      logout,
      setActiveOrganization,
      refreshUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider genutzt werden.')
  return context
}
