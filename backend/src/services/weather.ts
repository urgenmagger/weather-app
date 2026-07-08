import axios from 'axios'
import prisma from '../lib/prisma'

const WEATHER_API = process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1'

interface CityWeather {
  cityId: number
  temperature: number
  windSpeed: number
  weatherCode: number
  rawData: Record<string, unknown>
  fetchedAt: Date
}

export async function fetchWeatherForCity(
  latitude: number,
  longitude: number
): Promise<{ temperature: number; windSpeed: number; weatherCode: number }> {
  const { data } = await axios.get(`${WEATHER_API}/forecast`, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,wind_speed_10m,weather_code',
      timezone: 'auto',
    },
  })

  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
  }
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
