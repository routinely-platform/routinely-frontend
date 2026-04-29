import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Spinner from '@/components/common/Spinner'

export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <Spinner />
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
