import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Spinner from '@/components/common/Spinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
