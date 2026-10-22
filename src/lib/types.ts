export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  open: string
  close: string
  closed?: boolean
}

export interface Station {
  id: string
  /** URL slug (required by API) */
  slug: string
  name: string
  logoUrl: string | null
  tagline: string
  description: string
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  socialLinks: Record<string, string>
  services: string[]
  hours: Record<DayKey, DayHours>
  isActive: boolean
}

export interface FuelType {
  id: string
  name: string
  code: string
  tankCapacityLitres: number
  lowThresholdLitres: number
  isActive: boolean
}

export interface FuelPriceRow {
  stationId: string
  fuelTypeId: string
  pricePerLitre: number
  source: 'api' | 'manual'
  recordedAt: string
  overrideActive?: boolean
}

export interface FuelLevelRow {
  stationId: string
  fuelTypeId: string
  volumeLitres: number
  source: 'api' | 'manual'
  recordedAt: string
  unavailable?: boolean
}

export type AdminRole = 'corporate_admin' | 'station_manager'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AdminRole
  assignedStationIds: string[]
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  assignedStationIds: string[]
  lastLoginAt: string | null
}

export interface ActivityItem {
  id: string
  at: string
  message: string
}

export interface PriceHistoryRow {
  at: string
  fuelTypeName: string
  price: number
  source: 'api' | 'manual'
  changedBy: string
}

export interface ApiIntegrationStub {
  id: string
  name: string
  enabled: boolean
  status: 'connected' | 'degraded' | 'error'
  lastPollAt: string | null
  lastError: string | null
}
