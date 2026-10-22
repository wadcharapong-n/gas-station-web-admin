import type { FuelType } from '../types'
import { api } from './client'

export function mapApiFuelType(raw: unknown): FuelType {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid fuel type payload')
  }
  const r = raw as Record<string, unknown>
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    code: String(r.code ?? ''),
    tankCapacityLitres: Number(r.tankCapacityLitres ?? 0),
    lowThresholdLitres: Number(r.lowThresholdLitres ?? 0),
    isActive: Boolean(r.isActive ?? true),
  }
}

export interface FuelTypeWriteBody {
  name: string
  code: string
  tankCapacityLitres: number
  lowThresholdLitres: number
  isActive: boolean
}

/** GET /api/v1/manager/stations/:id/fuel-types — admin or assigned manager */
export async function fetchStationFuelTypes(stationId: string): Promise<FuelType[]> {
  const { data } = await api.get<unknown[]>(`/api/v1/manager/stations/${stationId}/fuel-types`)
  return Array.isArray(data) ? data.map(mapApiFuelType) : []
}

export async function createStationFuelType(
  stationId: string,
  body: FuelTypeWriteBody,
): Promise<FuelType> {
  const { data } = await api.post<unknown>(`/api/v1/manager/stations/${stationId}/fuel-types`, body)
  return mapApiFuelType(data)
}

export async function updateStationFuelType(
  stationId: string,
  fuelTypeId: string,
  body: FuelTypeWriteBody,
): Promise<FuelType> {
  const { data } = await api.put<unknown>(
    `/api/v1/manager/stations/${stationId}/fuel-types/${fuelTypeId}`,
    body,
  )
  return mapApiFuelType(data)
}
