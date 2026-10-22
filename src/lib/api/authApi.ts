import axios from 'axios'
import type { AuthUser } from '../types'
import { fetchAdminStations, fetchManagerStations } from './stationsApi'
import { fetchAdminUsers } from './usersApi'
import { loginApi } from './loginClient'

interface LoginResponse {
  token: string
}

/** POST /api/v1/auth/login */
export async function loginRequest(email: string, password: string): Promise<string> {
  const { data } = await loginApi.post<LoginResponse>('/api/v1/auth/login', { email, password })
  if (!data?.token) throw new Error('No token in response')
  return data.token
}

/** Resolve current user after login (JWT subject is email only; roles come from endpoint probes). */
export async function bootstrapSession(email: string): Promise<AuthUser> {
  try {
    await fetchAdminStations()
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 403) {
      const stations = await fetchManagerStations()
      return {
        id: '',
        name: email.split('@')[0] ?? email,
        email,
        role: 'station_manager',
        assignedStationIds: stations.map((s) => s.id),
      }
    }
    throw e
  }

  const users = await fetchAdminUsers()
  const row = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  return {
    id: row?.id ?? '',
    name: row?.name ?? email,
    email: row?.email ?? email,
    role: 'corporate_admin',
    assignedStationIds: [],
  }
}
