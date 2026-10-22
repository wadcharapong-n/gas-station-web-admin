import type { DayHours, DayKey, Station } from './types'

const DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as T
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

export function defaultStationHours(): Record<DayKey, DayHours> {
  const d: DayHours = { open: '09:00', close: '18:00' }
  return {
    mon: { ...d },
    tue: { ...d },
    wed: { ...d },
    thu: { ...d },
    fri: { ...d },
    sat: { ...d },
    sun: { ...d },
  }
}

/** Empty form state for POST /api/v1/admin/stations (id assigned by server). */
export function newStationDraft(): Station {
  return {
    id: '',
    slug: '',
    name: '',
    logoUrl: null,
    tagline: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    socialLinks: {},
    services: [],
    hours: defaultStationHours(),
    isActive: true,
  }
}

export function mapApiStation(raw: unknown): Station {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid station payload')
  }
  const r = raw as Record<string, unknown>
  const hoursObj = parseJson<Record<string, DayHours>>(r.hours, {})
  const mergedHours = defaultStationHours()
  for (const k of DAYS) {
    if (hoursObj[k]) mergedHours[k] = hoursObj[k]
  }

  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    logoUrl: r.logoUrl != null ? String(r.logoUrl) : null,
    tagline: String(r.tagline ?? ''),
    description: String(r.description ?? ''),
    address: String(r.address ?? ''),
    latitude: Number(r.latitude ?? 0),
    longitude: Number(r.longitude ?? 0),
    phone: String(r.phone ?? ''),
    email: String(r.email ?? ''),
    socialLinks: parseJson<Record<string, string>>(r.socialLinks, {}),
    services: parseJson<string[]>(r.services, []),
    hours: mergedHours,
    slug: String(r.slug ?? ''),
    isActive: Boolean(r.isActive ?? true),
  }
}

/** Body shape expected by Spring `Station` entity (JSONB fields as strings). */
export function stationToApiBody(s: Station): Record<string, unknown> {
  return {
    name: s.name,
    slug: s.slug,
    logoUrl: s.logoUrl,
    tagline: s.tagline,
    description: s.description,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    phone: s.phone,
    email: s.email,
    isActive: s.isActive,
    socialLinks: JSON.stringify(s.socialLinks ?? {}),
    services: JSON.stringify(s.services ?? []),
    hours: JSON.stringify(s.hours ?? {}),
  }
}
