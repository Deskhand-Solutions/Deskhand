import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthContext'
import { fetchOrganizationModules } from '../api/modules'

export const useEnabledModules = () => {
  const { activeOrganization } = useAuth()

  const query = useQuery({
    queryKey: ['organization-modules', activeOrganization?.slug],
    queryFn: () => fetchOrganizationModules(activeOrganization!.slug),
    enabled: Boolean(activeOrganization?.slug),
  })

  return {
    modules: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
