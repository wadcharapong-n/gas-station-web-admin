import { api } from './client'

export interface ApiUserRow {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt?: string
}

/** GET /api/v1/admin/users */
export async function fetchAdminUsers(): Promise<ApiUserRow[]> {
  const { data } = await api.get<unknown[]>('/api/v1/admin/users')
  if (!Array.isArray(data)) return []
  return data.map((raw) => {
    const r = raw as Record<string, unknown>
    return {
      id: String(r.id ?? ''),
      name: String(r.name ?? ''),
      email: String(r.email ?? ''),
      role: String(r.role ?? ''),
      isActive: Boolean(r.isActive ?? true),
      lastLoginAt: r.lastLoginAt != null ? String(r.lastLoginAt) : null,
      createdAt: r.createdAt != null ? String(r.createdAt) : undefined,
    }
  })
}
