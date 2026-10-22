import type { AdminRole } from './types'

export function canAccessStation(role: AdminRole, stationId: string, assignedIds: string[]): boolean {
  if (role === 'corporate_admin') return true
  return assignedIds.includes(stationId)
}
