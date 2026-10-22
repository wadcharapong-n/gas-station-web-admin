import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'corporate_admin'
  const isManager = user?.role === 'station_manager'

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-[var(--color-admin-sidebar)] text-white">
      <div className="border-b border-slate-700 p-4">
        <p className="text-lg font-bold tracking-tight">Back-Office</p>
        <p className="text-xs text-slate-400">Gas Station</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        <NavLink to="/dashboard" className={linkClass} end>
          Dashboard
        </NavLink>
        {isAdmin ? (
          <>
            <NavLink to="/stations" className={linkClass}>
              Stations
            </NavLink>
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              API settings
            </NavLink>
          </>
        ) : null}
        {isManager ? (
          <>
            <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              My station
            </p>
            <NavLink to="/my-station/profile" className={linkClass}>
              Profile
            </NavLink>
            <NavLink to="/my-station/fuel-types" className={linkClass}>
              Fuel types
            </NavLink>
            <NavLink to="/my-station/prices" className={linkClass}>
              Fuel prices
            </NavLink>
            <NavLink to="/my-station/fuel" className={linkClass}>
              Tank levels
            </NavLink>
          </>
        ) : null}
      </nav>
      <div className="border-t border-slate-700 p-3">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
