import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAdminStations } from '../lib/api/stationsApi'
import type { Station } from '../lib/types'

export function StationsListPage() {
  const navigate = useNavigate()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchAdminStations()
        if (!cancelled) setStations(data)
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load stations')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-slate-600">Loading stations…</p>
  if (err) return <p className="text-red-600">{err}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stations</h1>
          <p className="text-slate-600">From GET /api/v1/admin/stations</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/stations/new')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add station
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Address</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {stations.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.slug}</td>
                <td className="px-5 py-3 text-slate-600">{s.address}</td>
                <td className="px-5 py-3">{s.isActive ? 'Yes' : 'No'}</td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/stations/${s.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    Edit
                  </Link>
                  {' · '}
                  <Link
                    to={`/stations/${s.id}/prices`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Prices
                  </Link>
                  {' · '}
                  <Link
                    to={`/stations/${s.id}/fuel-types`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Fuel types
                  </Link>
                  {' · '}
                  <Link
                    to={`/stations/${s.id}/fuel`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Tank levels
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
