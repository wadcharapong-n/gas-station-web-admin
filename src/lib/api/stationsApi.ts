import type { Station } from '../types'
import { api } from './client'
import { mapApiStation, stationToApiBody } from '../mapStation'

/** GET /api/v1/admin/stations — Corporate Admin only */
export async function fetchAdminStations(): Promise<Station[]> {
  const { data } = await api.get<unknown[]>('/api/v1/admin/stations')
  return Array.isArray(data) ? data.map(mapApiStation) : []
}

/** POST /api/v1/admin/stations — Corporate Admin only */
export async function createAdminStation(station: Station): Promise<Station> {
  const body = stationToApiBody(station)
  const { data } = await api.post<unknown>('/api/v1/admin/stations', body)
  return mapApiStation(data)
}

/** GET /api/v1/manager/stations */
export async function fetchManagerStations(): Promise<Station[]> {
  const { data } = await api.get<unknown[]>('/api/v1/manager/stations')
  return Array.isArray(data) ? data.map(mapApiStation) : []
}

export async function fetchStationsForRole(role: 'corporate_admin' | 'station_manager'): Promise<Station[]> {
  return role === 'corporate_admin' ? fetchAdminStations() : fetchManagerStations()
}

/** GET /api/v1/manager/stations/:id — both roles (with access) */
export async function fetchStationById(stationId: string): Promise<Station> {
  const { data } = await api.get<unknown>(`/api/v1/manager/stations/${stationId}`)
  return mapApiStation(data)
}

/** PUT admin or manager depending on role */
export async function saveStation(
  role: 'corporate_admin' | 'station_manager',
  stationId: string,
  station: Station,
): Promise<Station> {
  const body = stationToApiBody(station)
  if (role === 'corporate_admin') {
    const { data } = await api.put<unknown>(`/api/v1/admin/stations/${stationId}`, body)
    return mapApiStation(data)
  }
  const { data } = await api.put<unknown>(`/api/v1/manager/stations/${stationId}`, body)
  return mapApiStation(data)
}

export interface FuelBoardRow {
  fuelTypeId: string
  name: string
  code: string
  tankCapacityLitres: number
  lowThresholdLitres: number
  isActive: boolean
  pricePerLitre: number | null
  priceSource: string | null
  priceRecordedAt: string | null
  volumeLitres: number | null
  levelSource: string | null
  levelRecordedAt: string | null
}

export async function fetchFuelBoard(stationId: string): Promise<FuelBoardRow[]> {
  const { data } = await api.get<unknown[]>(`/api/v1/manager/stations/${stationId}/fuel-board`)
  if (!Array.isArray(data)) return []
  return data.map((raw) => {
    const r = raw as Record<string, unknown>
    return {
      fuelTypeId: String(r.fuelTypeId ?? ''),
      name: String(r.name ?? ''),
      code: String(r.code ?? ''),
      tankCapacityLitres: Number(r.tankCapacityLitres ?? 0),
      lowThresholdLitres: Number(r.lowThresholdLitres ?? 0),
      isActive: Boolean(r.isActive ?? true),
      pricePerLitre: r.pricePerLitre != null ? Number(r.pricePerLitre) : null,
      priceSource: r.priceSource != null ? String(r.priceSource) : null,
      priceRecordedAt: r.priceRecordedAt != null ? String(r.priceRecordedAt) : null,
      volumeLitres: r.volumeLitres != null ? Number(r.volumeLitres) : null,
      levelSource: r.levelSource != null ? String(r.levelSource) : null,
      levelRecordedAt: r.levelRecordedAt != null ? String(r.levelRecordedAt) : null,
    }
  })
}

export async function postPriceOverride(stationId: string, fuelTypeId: string, price: number): Promise<void> {
  await api.post(`/api/v1/manager/stations/${stationId}/prices`, {
    fuelTypeId,
    price,
  })
}

export async function postFuelLevelOverride(
  stationId: string,
  fuelTypeId: string,
  volumeLitres: number,
): Promise<void> {
  await api.post(`/api/v1/manager/stations/${stationId}/fuel-levels`, {
    fuelTypeId,
    volumeLitres,
  })
}
