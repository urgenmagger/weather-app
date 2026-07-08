export interface GeoResult {
  id: number
  name: string
  country: string
  region: string | null
  latitude: number
  longitude: number
}

export interface CurrentWeather {
  temperature: number
  windSpeed: number
  weatherCode: number
  fetchedAt: string
  stale: boolean
}

export interface City {
  id: number
  name: string
  latitude: number
  longitude: number
  currentWeather: CurrentWeather | null
}
