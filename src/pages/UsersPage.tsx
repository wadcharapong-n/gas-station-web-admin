import { useEffect, useState } from 'react'
import { fetchAdminUsers, type ApiUserRow } from '../lib/api/usersApi'

function displayRole(apiRole: string): string {
  if (apiRole === 'STATION_MANAGER') return 'Station manager'
  if (apiRole === 'CORPORATE_ADMIN') return 'Corporate admin'
  return apiRole.replace(/_/g, ' ').toLowerCase()
}

export function UsersPage() {
  const [users, setUsers] = useState<ApiUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const list = await fetchAdminUsers()
        if (!cancelled) setUsers(list)
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-slate-600">Loading users…</p>
  if (err) return <p className="text-red-600">{err}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600">From GET /api/v1/admin/users</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3 text-slate-600">{displayRole(u.role)}</td>
                <td className="px-5 py-3 text-slate-600">{u.isActive ? 'Yes' : 'No'}</td>
                <td className="px-5 py-3 text-slate-600">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">
        Station assignments are not included in this API response yet; use POST /api/v1/admin/users/assign when wired
        in the UI.
      </p>
    </div>
  )
}
