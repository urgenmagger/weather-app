import type { City, GeoResult, CitiesResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function fetchCities(): Promise<CitiesResponse> {
  return request<CitiesResponse>('/api/cities')
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

export async function syncCity(id: number): Promise<{ synced: number }> {
  return request<{ synced: number }>(`/api/cities/${id}/sync`, { method: 'POST' })
}

export async function saveWeather(
  id: number,
  weather: { temperature: number; windSpeed: number; weatherCode: number }
): Promise<void> {
  await request(`/api/cities/${id}/weather`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weather),
  })
}

export async function fetchWeatherDirect(lat: number, lng: number): Promise<{
  temperature: number
  windSpeed: number
  weatherCode: number
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,weather_code`
  const res = await fetch(url)
  const data = await res.json()
  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
  }
}
