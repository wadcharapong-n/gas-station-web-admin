import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  createStationFuelType,
  fetchStationFuelTypes,
  updateStationFuelType,
  type FuelTypeWriteBody,
} from '../lib/api/fuelTypesApi'
import { fetchStationById } from '../lib/api/stationsApi'
import type { FuelType } from '../lib/types'
import { canAccessStation } from '../lib/stationAccess'
import { useAuthStore } from '../store/authStore'

function emptyWriteBody(): FuelTypeWriteBody {
  return {
    name: '',
    code: '',
    tankCapacityLitres: 0,
    lowThresholdLitres: 0,
    isActive: true,
  }
}

function toWriteBody(ft: FuelType): FuelTypeWriteBody {
  return {
    name: ft.name,
    code: ft.code,
    tankCapacityLitres: ft.tankCapacityLitres,
    lowThresholdLitres: ft.lowThresholdLitres,
    isActive: ft.isActive,
  }
}

export function StationFuelTypesPage({ mode }: { mode?: 'assigned' }) {
  const { stationId: paramId } = useParams()
  const user = useAuthStore((s) => s.user)
  const stationId = mode === 'assigned' ? user?.assignedStationIds[0] : paramId

  const [stationName, setStationName] = useState('')
  const [rows, setRows] = useState<FuelType[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<FuelTypeWriteBody>(emptyWriteBody())
  const [addForm, setAddForm] = useState<FuelTypeWriteBody>(emptyWriteBody())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!stationId) return
    setLoading(true)
    setErr(null)
    try {
      const [st, list] = await Promise.all([
        fetchStationById(stationId),
        fetchStationFuelTypes(stationId),
      ])
      setStationName(st.name)
      setRows(list)
      setEditingId(null)
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

  if (loading) return <p className="text-slate-600">Loading fuel types…</p>
  if (err) return <p className="text-red-600">{err}</p>

  const profileLink =
    user.role === 'corporate_admin' ? `/stations/${stationId}` : '/my-station/profile'
  const pricesLink =
    user.role === 'corporate_admin' ? `/stations/${stationId}/prices` : '/my-station/prices'
  const levelsLink =
    user.role === 'corporate_admin' ? `/stations/${stationId}/fuel` : '/my-station/fuel'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fuel types</h1>
        <p className="text-slate-600">{stationName}</p>
        <p className="mt-1 text-sm text-slate-500">
          Define products sold at this station (code must be unique per station). Use{' '}
          <Link to={pricesLink} className="font-medium text-blue-600 hover:text-blue-800">
            Prices
          </Link>{' '}
          and{' '}
          <Link to={levelsLink} className="font-medium text-blue-600 hover:text-blue-800">
            Tank levels
          </Link>{' '}
          for live readings and overrides.
        </p>
        <Link to={profileLink} className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800">
          ← Back to station
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Tank (L)</th>
              <th className="px-5 py-3 font-medium">Low alert (L)</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-slate-500">
                  No fuel types yet. Add one below.
                </td>
              </tr>
            ) : (
              rows.map((ft) => {
                const isEditing = editingId === ft.id
                const d = isEditing ? editDraft : toWriteBody(ft)
                return (
                  <tr key={ft.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          className="w-full min-w-[8rem] rounded border border-slate-300 px-2 py-1"
                          value={d.name}
                          onChange={(e) => setEditDraft((x) => ({ ...x, name: e.target.value }))}
                        />
                      ) : (
                        <span className="font-medium text-slate-900">{ft.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          className="w-full min-w-[6rem] rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                          value={d.code}
                          onChange={(e) => setEditDraft((x) => ({ ...x, code: e.target.value }))}
                        />
                      ) : (
                        <span className="font-mono text-slate-700">{ft.code}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-24 rounded border border-slate-300 px-2 py-1 tabular-nums"
                          value={d.tankCapacityLitres}
                          onChange={(e) =>
                            setEditDraft((x) => ({
                              ...x,
                              tankCapacityLitres: Number(e.target.value),
                            }))
                          }
                        />
                      ) : (
                        <span className="tabular-nums">{ft.tankCapacityLitres}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-24 rounded border border-slate-300 px-2 py-1 tabular-nums"
                          value={d.lowThresholdLitres}
                          onChange={(e) =>
                            setEditDraft((x) => ({
                              ...x,
                              lowThresholdLitres: Number(e.target.value),
                            }))
                          }
                        />
                      ) : (
                        <span className="tabular-nums">{ft.lowThresholdLitres}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={d.isActive}
                          onChange={(e) => setEditDraft((x) => ({ ...x, isActive: e.target.checked }))}
                        />
                      ) : (
                        <span>{ft.isActive ? 'Yes' : 'No'}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isEditing ? (
                        <span className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={savingId === ft.id}
                            className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            onClick={async () => {
                              if (!d.name.trim() || !d.code.trim()) {
                                window.alert('Name and code are required.')
                                return
                              }
                              setSavingId(ft.id)
                              try {
                                await updateStationFuelType(stationId, ft.id, {
                                  ...d,
                                  name: d.name.trim(),
                                  code: d.code.trim(),
                                })
                                await load()
                              } catch (ex) {
                                window.alert(ex instanceof Error ? ex.message : 'Save failed')
                              } finally {
                                setSavingId(null)
                              }
                            }}
                          >
                            {savingId === ft.id ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setEditingId(ft.id)
                            setEditDraft(toWriteBody(ft))
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add fuel type</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Code</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              value={addForm.code}
              onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. DIESEL_B7"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Tank capacity (L)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={addForm.tankCapacityLitres}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, tankCapacityLitres: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Low threshold (L)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={addForm.lowThresholdLitres}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, lowThresholdLitres: Number(e.target.value) }))
              }
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={addForm.isActive}
            onChange={(e) => setAddForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active
        </label>
        <button
          type="button"
          disabled={creating}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={async () => {
            if (!addForm.name.trim() || !addForm.code.trim()) {
              window.alert('Name and code are required.')
              return
            }
            setCreating(true)
            try {
              await createStationFuelType(stationId, {
                ...addForm,
                name: addForm.name.trim(),
                code: addForm.code.trim(),
              })
              setAddForm(emptyWriteBody())
              await load()
            } catch (ex) {
              window.alert(ex instanceof Error ? ex.message : 'Create failed')
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? 'Creating…' : 'Create fuel type'}
        </button>
      </section>
    </div>
  )
}
