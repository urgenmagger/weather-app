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

export interface CitiesResponse {
  cities: City[]
  serviceAvailable: boolean
}

export const WEATHER_EMOJI: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  80: '🌦️',
  81: '🌦️',
  82: '🌦️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
}

export function weatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Ясно',
    1: 'Малооблачно',
    2: 'Переменная облачность',
    3: 'Пасмурно',
    45: 'Туман',
    48: 'Изморозь',
    51: 'Морось',
    53: 'Морось',
    55: 'Морось',
    61: 'Дождь',
    63: 'Дождь',
    65: 'Ливень',
    71: 'Снег',
    73: 'Снег',
    75: 'Снегопад',
    80: 'Ливни',
    81: 'Ливни',
    82: 'Ливни',
    95: 'Гроза',
    96: 'Гроза с градом',
    99: 'Гроза с градом',
  }
  return map[code] ?? '—'
}
