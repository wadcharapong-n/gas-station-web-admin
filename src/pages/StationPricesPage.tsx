import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  fetchFuelBoard,
  fetchStationById,
  postPriceOverride,
  type FuelBoardRow,
} from '../lib/api/stationsApi'
import { canAccessStation } from '../lib/stationAccess'
import { useAuthStore } from '../store/authStore'

export function StationPricesPage({ mode }: { mode?: 'assigned' }) {
  const { stationId: paramId } = useParams()
  const user = useAuthStore((s) => s.user)
  const stationId = mode === 'assigned' ? user?.assignedStationIds[0] : paramId

  const [stationName, setStationName] = useState('')
  const [rows, setRows] = useState<FuelBoardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!stationId) return
    setLoading(true)
    setErr(null)
    try {
      const [st, board] = await Promise.all([
        fetchStationById(stationId),
        fetchFuelBoard(stationId),
      ])
      setStationName(st.name)
      setRows(board.filter((r) => r.isActive))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [stationId])

  useEffect(() => {
    if (!stationId) return
    void load()
  }, [stationId, load])

  if (!user || !stationId) return <Navigate to="/dashboard" replace />
  if (!canAccessStation(user.role, stationId, user.assignedStationIds)) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) return <p className="text-slate-600">Loading prices…</p>
  if (err) return <p className="text-red-600">{err}</p>

  const sourceLabel = (s: string | null) => {
    if (!s) return '—'
    const x = s.toLowerCase()
    return x === 'manual' ? 'manual' : x === 'api' ? 'api' : s
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fuel prices</h1>
        <p className="text-slate-600">{stationName}</p>
        {user.role === 'corporate_admin' ? (
          <Link to={`/stations/${stationId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
            ← Back to station
          </Link>
        ) : (
          <Link to="/my-station/profile" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            ← Profile
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Fuel type</th>
              <th className="px-5 py-3 font-medium">Current (฿/L)</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Override</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-slate-500">
                  No active fuel types for this station.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.fuelTypeId} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-5 py-3 tabular-nums">
                    {row.pricePerLitre != null ? row.pricePerLitre.toFixed(2) : '—'}
                  </td>
                  <td className="px-5 py-3 capitalize">{sourceLabel(row.priceSource)}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="New price"
                      className="w-32 rounded border border-slate-300 px-2 py-1"
                      key={`${row.fuelTypeId}-${row.priceRecordedAt ?? ''}`}
                      defaultValue={row.pricePerLitre ?? ''}
                      onBlur={async (e) => {
                        const v = e.target.value.trim()
                        if (v === '') return
                        const n = Number(v)
                        if (Number.isNaN(n)) return
                        try {
                          await postPriceOverride(stationId, row.fuelTypeId, n)
                          await load()
                        } catch (ex) {
                          window.alert(ex instanceof Error ? ex.message : 'Override failed')
                        }
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        Detailed price history is not available from the API yet; overrides are saved immediately.
      </p>
    </div>
  )
}
