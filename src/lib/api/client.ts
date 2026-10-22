import axios from 'axios'

const TOKEN_KEY = 'gas-admin-token'

export function resolveApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  if (import.meta.env.DEV) return '/api'
  return 'http://localhost:8080'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

api.interceptors.request.use((config) => {
  const t = getStoredToken()
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})
