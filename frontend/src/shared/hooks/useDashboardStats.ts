import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthContext'
import { fetchDashboard } from '../api/dashboard'

export const useDashboardStats = () => {
  const { activeOrganization } = useAuth()

  return useQuery({
    queryKey: ['dashboard', activeOrganization?.slug],
    queryFn: fetchDashboard,
    enabled: Boolean(activeOrganization?.slug),
  })
}
