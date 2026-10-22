import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  fetchFuelBoard,
  fetchStationById,
  postFuelLevelOverride,
  type FuelBoardRow,
} from '../lib/api/stationsApi'
import { canAccessStation } from '../lib/stationAccess'
import { useAuthStore } from '../store/authStore'

export function StationFuelPage({ mode }: { mode?: 'assigned' }) {
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

  if (loading) return <p className="text-slate-600">Loading tank levels…</p>
  if (err) return <p className="text-red-600">{err}</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tank levels</h1>
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

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.length === 0 ? (
          <p className="text-slate-500">No active fuel types for this station.</p>
        ) : (
          rows.map((ft) => {
            const rawVol = ft.volumeLitres
            const unavailable = rawVol == null
            const cap = ft.tankCapacityLitres
            const pct =
              !unavailable && cap > 0
                ? Math.min(100, Math.round((rawVol / cap) * 100))
                : 0
            const low = !unavailable && rawVol <= ft.lowThresholdLitres

            return (
              <div
                key={ft.fuelTypeId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{ft.name}</h2>
                  {unavailable ? (
                    <span className="text-xs font-medium text-slate-500">No reading</span>
                  ) : low ? (
                    <span className="text-xs font-medium text-amber-700">Low</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {unavailable ? '—' : `${rawVol.toLocaleString()} L`} ·{' '}
                  {unavailable ? '—' : `${pct}%`} of {cap.toLocaleString()} L
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${low ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: unavailable ? '0%' : `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Alert threshold: {ft.lowThresholdLitres.toLocaleString()} L
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    placeholder="Override litres"
                    className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    key={`${ft.fuelTypeId}-${ft.levelRecordedAt ?? ''}`}
                    defaultValue={unavailable ? '' : String(rawVol)}
                    onBlur={async (e) => {
                      const v = e.target.value.trim()
                      if (v === '') return
                      const n = Number(v)
                      if (Number.isNaN(n)) return
                      try {
                        await postFuelLevelOverride(stationId, ft.fuelTypeId, n)
                        await load()
                      } catch (ex) {
                        window.alert(ex instanceof Error ? ex.message : 'Override failed')
                      }
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
