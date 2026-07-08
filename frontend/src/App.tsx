import { useState, useEffect } from 'react'
import CitySearch from './components/CitySearch'
import { fetchCities, addCity, deleteCity, syncWeather } from './api'
import type { City, GeoResult } from './types'

function App() {
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    fetchCities().then(setCities)
  }, [])

  async function handleAddCity(geo: GeoResult) {
    const city = await addCity({
      name: geo.name,
      latitude: geo.latitude,
      longitude: geo.longitude,
    })
    setCities((prev) => [...prev, city])
    handleSync()
  }

  async function handleDelete(id: number) {
    await deleteCity(id)
    setCities((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleSync() {
    try { await syncWeather() } catch { /* sync failed — stale will show */ }
    const updated = await fetchCities()
    setCities(updated)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Погода</h1>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Обновить погоду
          </button>
        </div>

        <CitySearch onSelect={handleAddCity} />

        {cities.map((city) => (
          <div key={city.id} className="mt-4 p-4 bg-white rounded-lg shadow relative">
            <button
              onClick={() => handleDelete(city.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
            >
              ×
            </button>
            <p className="text-lg font-medium">{city.name}</p>
            {city.currentWeather ? (
              <div className="mt-2 text-gray-600">
                <p className="text-xl">{city.currentWeather.temperature}°C</p>
                <p className="text-sm">Ветер: {city.currentWeather.windSpeed} м/с</p>
                {city.currentWeather.stale && (
                  <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    Сервис погоды не отвечает. Данные за{' '}
                    {new Date(city.currentWeather.fetchedAt).toLocaleString('ru')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Загрузка погоды...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
