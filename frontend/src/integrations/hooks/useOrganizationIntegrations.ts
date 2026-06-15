import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthContext'
import {
  fetchOrganizationIntegrations,
  saveOrganizationIntegration,
  disconnectOrganizationIntegration,
} from '../api'

export const useOrganizationIntegrations = () => {
  const { activeOrganization } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['organization-integrations', activeOrganization?.slug]

  const query = useQuery({
    queryKey,
    queryFn: () => fetchOrganizationIntegrations(activeOrganization!.slug),
    enabled: Boolean(activeOrganization?.slug),
  })

  const saveMutation = useMutation({
    mutationFn: (args: { providerSlug: string; credentials: Record<string, string> }) =>
      saveOrganizationIntegration(activeOrganization!.slug, args.providerSlug, args.credentials),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (providerSlug: string) =>
      disconnectOrganizationIntegration(activeOrganization!.slug, providerSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    integrations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    saveConnection: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    disconnectConnection: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  }
}
export type UseOrganizationIntegrationsResult = ReturnType<typeof useOrganizationIntegrations>
