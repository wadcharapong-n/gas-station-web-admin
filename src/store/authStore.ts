import { create } from 'zustand'
import { bootstrapSession, loginRequest } from '../lib/api/authApi'
import { getStoredToken, setStoredToken } from '../lib/api/client'
import type { AuthUser } from '../lib/types'

const IDLE_MS = 60 * 60 * 1000
const EMAIL_KEY = 'gas-admin-email'

interface AuthState {
  user: AuthUser | null
  lastActivityAt: number
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  touch: () => void
  isIdleExpired: () => boolean
  restoreSession: () => Promise<void>
}

function readStoredEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY)
  } catch {
    return null
  }
}

function writeStoredEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email)
    else localStorage.removeItem(EMAIL_KEY)
  } catch {
    /* ignore */
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  lastActivityAt: Date.now(),

  login: async (email, password) => {
    const trimmed = email.trim()
    try {
      const token = await loginRequest(trimmed, password)
      setStoredToken(token)
      writeStoredEmail(trimmed)
      const user = await bootstrapSession(trimmed)
      set({ user, lastActivityAt: Date.now() })
      return true
    } catch {
      setStoredToken(null)
      writeStoredEmail(null)
      return false
    }
  },

  logout: () => {
    setStoredToken(null)
    writeStoredEmail(null)
    set({ user: null })
  },

  touch: () => set({ lastActivityAt: Date.now() }),

  isIdleExpired: () => {
    const { user, lastActivityAt } = get()
    if (!user) return false
    return Date.now() - lastActivityAt > IDLE_MS
  },

  restoreSession: async () => {
    const token = getStoredToken()
    const email = readStoredEmail()
    if (!token || !email) return
    try {
      const user = await bootstrapSession(email)
      set({ user, lastActivityAt: Date.now() })
    } catch {
      setStoredToken(null)
      writeStoredEmail(null)
      set({ user: null })
    }
  },
}))
