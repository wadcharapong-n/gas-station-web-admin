import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuthStore } from '../store/authStore'

export function AdminLayout() {
  const touch = useAuthStore((s) => s.touch)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const onActivity = () => touch()
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    return () => {
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [touch])

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in</p>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">
            Session idle timeout: 60 min
          </p>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
