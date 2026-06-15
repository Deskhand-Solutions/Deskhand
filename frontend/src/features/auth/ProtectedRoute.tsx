import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../../shared/components/LoadingState'
import { useAuth } from './AuthContext'

export const ProtectedRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState message="Sitzung wird geladen …" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
