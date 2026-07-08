import axios from 'axios'
import prisma from '../lib/prisma'

const WTTR_URL = 'http://wttr.in'

interface CityWeather {
  cityId: number
  temperature: number
  windSpeed: number
  weatherCode: number
  rawData: Record<string, unknown>
  fetchedAt: Date
}

const CONDITION_MAP: Record<string, number> = {
  sunny: 0,
  clear: 0,
  'partly cloudy': 1,
  cloudy: 3,
  overcast: 3,
  mist: 45,
  fog: 45,
  'light drizzle': 51,
  drizzle: 53,
  'light rain': 61,
  rain: 63,
  'heavy rain': 65,
  snow: 71,
  'heavy snow': 75,
  thunderstorm: 95,
  'thunderstorm with hail': 96,
}

function parseWttr(raw: string): { temperature: number; windSpeed: number; weatherCode: number } {
  const parts = raw.trim().split('|')
  const tempStr = parts[0]?.replace(/[^+\-\d]/g, '') ?? '0'
  const windStr = parts[1]?.replace(/[^\d]/g, '') ?? '0'
  const condStr = (parts[2] ?? '').toLowerCase()

  const temperature = parseInt(tempStr, 10) || 0
  const windSpeed = parseInt(windStr, 10) || 0

  let weatherCode = 3
  for (const [key, code] of Object.entries(CONDITION_MAP)) {
    if (condStr.includes(key)) {
      weatherCode = code
      break
    }
  }

  return { temperature, windSpeed, weatherCode }
}

export async function fetchWeatherForCity(
  latitude: number,
  longitude: number
): Promise<{ temperature: number; windSpeed: number; weatherCode: number }> {
  const { data } = await axios.get(`${WTTR_URL}/${latitude},${longitude}`, {
    params: { format: '%t|%w|%C' },
    timeout: 10000,
  })
  return parseWttr(data)
}

export async function syncAllCities(): Promise<CityWeather[]> {
  const cities = await prisma.city.findMany()
  const results: CityWeather[] = []

  for (const city of cities) {
    try {
      const weather = await fetchWeatherForCity(city.latitude, city.longitude)
      const record = await prisma.weather.create({
        data: {
          cityId: city.id,
          temperature: weather.temperature,
          windSpeed: weather.windSpeed,
          weatherCode: weather.weatherCode,
          rawData: weather,
        },
      })
      results.push({
        cityId: city.id,
        ...weather,
        rawData: weather,
        fetchedAt: record.fetchedAt,
      })
    } catch (err) {
      console.error(`Failed to fetch weather for city ${city.name}:`, err)
    }
  }

  return results
}
