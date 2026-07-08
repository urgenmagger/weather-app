import { useState, useEffect } from 'react'
import CitySearch from './components/CitySearch'
import { fetchCities, addCity, deleteCity, syncWeather, syncCity } from './api'
import type { City, GeoResult } from './types'
import { WEATHER_EMOJI, weatherDescription } from './types'

function App() {
  const [cities, setCities] = useState<City[]>([])
  const [serviceAvailable, setServiceAvailable] = useState(true)

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    const data = await fetchCities()
    setCities(data.cities)
    setServiceAvailable(data.serviceAvailable)
  }

  async function handleAddCity(geo: GeoResult) {
    const city = await addCity({
      name: geo.name,
      latitude: geo.latitude,
      longitude: geo.longitude,
    })
    setCities((prev) => [...prev, city])
    syncCity(city.id).then(() => loadCities())
  }

  async function handleDelete(id: number) {
    await deleteCity(id)
    setCities((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleSync() {
    try { await syncWeather() } catch { /* failed */ }
    await loadCities()
  }

  async function handleToggleDebug() {
    await fetch('http://localhost:3000/api/debug/set-unavailable', { method: 'POST' })
    await loadCities()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Погода</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full cursor-pointer ${serviceAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
                onDoubleClick={handleToggleDebug}
                title="Двойной клик — симулировать недоступность"
              />
              <span className="text-xs text-gray-400">
                {serviceAvailable ? 'Сервис доступен' : 'Сервис недоступен'}
              </span>
            </div>
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
            >
              Обновить
            </button>
          </div>
        </div>

        <CitySearch onSelect={handleAddCity} />

        <div className="mt-6 space-y-4">
          {cities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => handleDelete(city.id)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-lg leading-none"
              >
                ×
              </button>

              <h2 className="text-lg font-semibold text-gray-800">{city.name}</h2>

              {city.currentWeather ? (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {WEATHER_EMOJI[city.currentWeather.weatherCode] ?? '🌈'}
                    </span>
                    <div>
                      <p className="text-3xl font-light text-gray-800">
                        {city.currentWeather.temperature}°
                      </p>
                      <p className="text-sm text-gray-400">
                        {weatherDescription(city.currentWeather.weatherCode)}
                      </p>
                    </div>
                    <div className="ml-auto text-right text-sm text-gray-400">
                      <p>Ветер</p>
                      <p className="text-gray-600 font-medium">
                        {city.currentWeather.windSpeed} м/с
                      </p>
                    </div>
                  </div>

                  {city.currentWeather.stale && (
                    <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                      Сервис погоды не отвечает. Данные за{' '}
                      {new Date(city.currentWeather.fetchedAt).toLocaleString('ru')}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-300 animate-pulse">
                  Загрузка погоды...
                </p>
              )}
            </div>
          ))}

          {cities.length === 0 && (
            <p className="text-center text-gray-400 mt-12">
              Добавьте город в избранное
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
