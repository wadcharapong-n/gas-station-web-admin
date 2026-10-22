import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  const isIdleExpired = useAuthStore((s) => s.isIdleExpired)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isIdleExpired()) {
    logout()
    return <Navigate to="/login" replace state={{ from: location.pathname, expired: true }} />
  }

  return <Outlet />
}
