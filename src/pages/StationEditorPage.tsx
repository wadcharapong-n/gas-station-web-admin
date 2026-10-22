import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchStationById, saveStation } from '../lib/api/stationsApi'
import type { AuthUser, Station } from '../lib/types'
import { canAccessStation } from '../lib/stationAccess'
import { useAuthStore } from '../store/authStore'

function StationEditorForm({
  station,
  user,
  mode,
}: {
  station: Station
  user: AuthUser
  mode?: 'assigned'
}) {
  const [form, setForm] = useState<Station>(() => ({ ...station }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const update = (patch: Partial<Station>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'assigned' ? 'Station profile' : 'Edit station'}
        </h1>
        <p className="text-slate-600">{form.name}</p>
        {user.role === 'corporate_admin' && mode !== 'assigned' ? (
          <p className="mt-2 text-sm text-slate-500">
            <Link to={`/stations/${station.id}/fuel-types`} className="font-medium text-blue-600 hover:text-blue-800">
              Fuel types
            </Link>
            {' · '}
            <Link to={`/stations/${station.id}/prices`} className="font-medium text-blue-600 hover:text-blue-800">
              Prices
            </Link>
            {' · '}
            <Link to={`/stations/${station.id}/fuel`} className="font-medium text-blue-600 hover:text-blue-800">
              Tank levels
            </Link>
          </p>
        ) : null}
        {user.role === 'station_manager' && mode === 'assigned' ? (
          <p className="mt-2 text-sm text-slate-500">
            <Link to="/my-station/fuel-types" className="font-medium text-blue-600 hover:text-blue-800">
              Fuel types
            </Link>
            {' · '}
            <Link to="/my-station/prices" className="font-medium text-blue-600 hover:text-blue-800">
              Prices
            </Link>
            {' · '}
            <Link to="/my-station/fuel" className="font-medium text-blue-600 hover:text-blue-800">
              Tank levels
            </Link>
          </p>
        ) : null}
      </div>
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      ) : null}
      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          setMessage(null)
          setSaving(true)
          try {
            await saveStation(user.role, station.id, form)
            setMessage('Saved successfully.')
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Save failed')
          } finally {
            setSaving(false)
          }
        }}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.slug}
            onChange={(e) => update({ slug: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tagline</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.tagline}
            onChange={(e) => update({ tagline: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Latitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.latitude}
              onChange={(e) => update({ latitude: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Longitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.longitude}
              onChange={(e) => update({ longitude: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Services (one per line)
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            rows={4}
            value={form.services.join('\n')}
            onChange={(e) =>
              update({
                services: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        {user.role === 'corporate_admin' ? (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update({ isActive: e.target.checked })}
            />
            Station active
          </label>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

export function StationEditorPage({ mode }: { mode?: 'assigned' }) {
  const { stationId: paramId } = useParams()
  const user = useAuthStore((s) => s.user)
  const stationId = mode === 'assigned' ? user?.assignedStationIds[0] : paramId

  const [station, setStation] = useState<Station | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !stationId) return
    if (!canAccessStation(user.role, stationId, user.assignedStationIds)) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadErr(null)
      try {
        const s = await fetchStationById(stationId)
        if (!cancelled) setStation(s)
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : 'Failed to load station')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, stationId])

  if (!user || !stationId) {
    return <Navigate to="/dashboard" replace />
  }
  if (!canAccessStation(user.role, stationId, user.assignedStationIds)) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) return <p className="text-slate-600">Loading station…</p>
  if (loadErr) return <p className="text-red-600">{loadErr}</p>
  if (!station) {
    return (
      <Navigate to={user.role === 'corporate_admin' ? '/stations' : '/dashboard'} replace />
    )
  }

  return <StationEditorForm key={station.id} station={station} user={user} mode={mode} />
}
