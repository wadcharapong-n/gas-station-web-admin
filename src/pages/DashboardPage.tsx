import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFuelBoard, fetchStationsForRole } from '../lib/api/stationsApi'
import { canAccessStation } from '../lib/stationAccess'
import type { Station } from '../lib/types'
import { useAuthStore } from '../store/authStore'

async function lowFuelCountForStation(stationId: string): Promise<number> {
  try {
    const rows = await fetchFuelBoard(stationId)
    let n = 0
    for (const r of rows) {
      if (r.volumeLitres == null) continue
      if (r.volumeLitres <= r.lowThresholdLitres) n += 1
    }
    return n
  } catch {
    return 0
  }
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [stations, setStations] = useState<Station[]>([])
  const [lowByStation, setLowByStation] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const list = await fetchStationsForRole(user.role)
        if (cancelled) return
        setStations(list)
        const entries = await Promise.all(
          list.map(async (s) => [s.id, await lowFuelCountForStation(s.id)] as const),
        )
        if (cancelled) return
        setLowByStation(Object.fromEntries(entries))
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const totalLow = Object.values(lowByStation).reduce((a, b) => a + b, 0)
  const openStations = stations.filter((s) => s.isActive).length

  if (loading) {
    return <p className="text-slate-600">Loading dashboard…</p>
  }
  if (err) {
    return <p className="text-red-600">{err}</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          {user.role === 'corporate_admin'
            ? 'Network overview and alerts'
            : 'Your assigned station(s)'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Stations in view</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stations.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active stations</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{openStations}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Low-fuel tank flags</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{totalLow}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Stations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Alerts</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-3 text-slate-600">{s.slug}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        s.isActive ? 'text-emerald-600' : 'text-slate-400 line-through'
                      }
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-amber-700">{lowByStation[s.id] ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    {canAccessStation(user.role, s.id, user.assignedStationIds) &&
                    user.role === 'corporate_admin' ? (
                      <Link
                        to={`/stations/${s.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Manage
                      </Link>
                    ) : user.role === 'station_manager' ? (
                      <Link
                        to="/my-station/profile"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Open
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Recent activity</h2>
        <p className="mt-2 text-sm text-slate-500">
          Activity feed will appear when the backend exposes an audit/events API.
        </p>
      </section>
    </div>
  )
}
