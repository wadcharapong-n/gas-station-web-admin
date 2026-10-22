import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminStation } from '../lib/api/stationsApi'
import { newStationDraft } from '../lib/mapStation'
import type { Station } from '../lib/types'

function slugifyHint(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function StationCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Station>(() => newStationDraft())
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const update = (patch: Partial<Station>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/stations" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← Back to stations
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create station</h1>
        <p className="text-slate-600">POST /api/v1/admin/stations — name and slug are required by the API.</p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!form.name.trim() || !form.slug.trim()) {
            window.alert('Name and slug are required.')
            return
          }
          setSaving(true)
          try {
            const created = await createAdminStation(form)
            navigate(`/stations/${created.id}`, { replace: true })
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Create failed')
          } finally {
            setSaving(false)
          }
        }}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value
              update({
                name,
                ...(!slugTouched && name.trim() ? { slug: slugifyHint(name) } : {}),
              })
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              update({ slug: e.target.value })
            }}
            onBlur={() => {
              if (form.slug.trim()) setSlugTouched(true)
            }}
            required
            placeholder="e.g. bangkok-main"
          />
          <p className="mt-1 text-xs text-slate-500">Unique across all stations; used in the public site URL.</p>
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
          <label className="block text-sm font-medium text-slate-700">Logo URL</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.logoUrl ?? ''}
            onChange={(e) => update({ logoUrl: e.target.value.trim() ? e.target.value : null })}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Services (one per line)</label>
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
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update({ isActive: e.target.checked })}
          />
          Station active
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create station'}
          </button>
          <Link
            to="/stations"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
