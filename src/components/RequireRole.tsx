import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AdminRole } from '../lib/types'
import { useAuthStore } from '../store/authStore'

export function RequireRole({
  allow,
  children,
}: {
  allow: AdminRole | AdminRole[]
  children: ReactNode
}) {
  const user = useAuthStore((s) => s.user)
  const list = Array.isArray(allow) ? allow : [allow]
  if (!user || !list.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
