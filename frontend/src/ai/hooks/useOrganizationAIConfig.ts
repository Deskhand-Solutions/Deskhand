import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthContext'
import { fetchOrganizationAIConfig } from '../api'

export const useOrganizationAIConfig = () => {
  const { activeOrganization } = useAuth()

  const query = useQuery({
    queryKey: ['organization-ai-config', activeOrganization?.slug],
    queryFn: fetchOrganizationAIConfig,
    enabled: Boolean(activeOrganization?.slug),
  })

  return {
    providers: query.data?.providers ?? [],
    moduleBindings: query.data?.module_bindings ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
