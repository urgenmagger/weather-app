import type { City, GeoResult } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchCities(): Promise<City[]> {
  return request<City[]>('/api/cities')
}

export async function addCity(body: {
  name: string
  latitude: number
  longitude: number
}): Promise<City> {
  return request<City>('/api/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function deleteCity(id: number): Promise<void> {
  await request<void>(`/api/cities/${id}`, { method: 'DELETE' })
}

export async function searchGeo(query: string): Promise<GeoResult[]> {
  return request<GeoResult[]>(`/api/geo?q=${encodeURIComponent(query)}`)
}

export async function syncWeather(): Promise<{ synced: number }> {
  return request<{ synced: number }>('/api/sync', { method: 'POST' })
}
