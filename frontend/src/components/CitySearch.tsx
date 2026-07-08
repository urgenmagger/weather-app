import { useState, useEffect, useRef } from 'react'
import { searchGeo } from '../api'
import type { GeoResult } from '../types'

interface Props {
  onSelect: (city: GeoResult) => void
}

export default function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const cities = await searchGeo(query)
        setResults(cities)
        setOpen(cities.length > 0)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(city: GeoResult) {
    onSelect(city)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск городов..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-sm">
          ...
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((city) => (
            <li
              key={city.id}
              onClick={() => handleSelect(city)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
            >
              <span className="font-medium">{city.name}</span>
              <span className="text-gray-400 text-sm ml-2">
                {city.country}
                {city.region ? `, ${city.region}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
