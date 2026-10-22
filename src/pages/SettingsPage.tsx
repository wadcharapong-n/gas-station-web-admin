import { useState } from 'react'
import { resolveApiBaseUrl } from '../lib/api/client'

export function SettingsPage() {
  const effectiveBase = resolveApiBaseUrl()
  const [pollPrices, setPollPrices] = useState('20')
  const [pollLevels, setPollLevels] = useState('8')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API settings & health</h1>
        <p className="text-slate-600">
          Admin UI talks to the backend using the base URL below (dev proxy: <code className="text-xs">/api</code> →{' '}
          <code className="text-xs">http://localhost:8080</code>).
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700">Effective API base URL</p>
        <p className="mt-1 font-mono text-sm text-slate-900">{effectiveBase}</p>
        <p className="mt-2 text-xs text-slate-500">
          Override with <code className="font-mono">VITE_API_BASE_URL</code> in production builds.
        </p>
      </div>

      <form
        className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          window.alert('Global poll intervals and integration keys are not exposed by the API yet.')
        }}
      >
        <p className="text-sm text-slate-600">
          Placeholder fields for future <code className="text-xs">PUT /admin/settings</code> (values are not saved).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Price poll (minutes)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={pollPrices}
              onChange={(e) => setPollPrices(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Level poll (minutes)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={pollLevels}
              onChange={(e) => setPollLevels(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save settings
        </button>
      </form>

      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <h2 className="font-semibold text-slate-900">Integration health</h2>
        <p className="mt-2 text-sm text-slate-600">
          No integration status endpoint is available on the backend yet. When it exists, connection state and last
          poll times can be shown here.
        </p>
      </section>
    </div>
  )
}
