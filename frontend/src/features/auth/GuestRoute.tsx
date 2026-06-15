import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export const GuestRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
