import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { fetchWeatherForCity } from '../services/weather'

const router = Router()

const STALE_THRESHOLD_MS = 30 * 60 * 1000

router.get('/', async (_req: Request, res: Response) => {
  const [cities, lastSync] = await Promise.all([
    prisma.city.findMany({
      include: {
        weather: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
          select: {
            temperature: true,
            windSpeed: true,
            weatherCode: true,
            fetchedAt: true,
          },
        },
      },
    }),
    prisma.syncLog.findFirst({
      orderBy: { attemptedAt: 'desc' },
      select: { success: true, attemptedAt: true },
    }),
  ])

  const syncFailed = lastSync && !lastSync.success
  const now = Date.now()

  const serviceAvailable = !syncFailed

  const result = cities.map((city) => {
    const latest = city.weather[0] ?? null
    const isStale = Boolean(
      latest &&
        syncFailed &&
        now - latest.fetchedAt.getTime() > STALE_THRESHOLD_MS
    )

    return {
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      currentWeather: latest
        ? {
            temperature: latest.temperature,
            windSpeed: latest.windSpeed,
            weatherCode: latest.weatherCode,
            fetchedAt: latest.fetchedAt.toISOString(),
            stale: isStale,
          }
        : null,
    }
  })

  res.json({ cities: result, serviceAvailable })
})

router.post('/', async (req: Request, res: Response) => {
  const { name, latitude, longitude } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    res.status(400).json({ error: 'latitude must be a number between -90 and 90' })
    return
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    res.status(400).json({ error: 'longitude must be a number between -180 and 180' })
    return
  }

  const existing = await prisma.city.findUnique({ where: { name: name.trim() } })
  if (existing) {
    res.status(409).json({ error: 'city already exists' })
    return
  }

  const city = await prisma.city.create({
    data: { name: name.trim(), latitude, longitude },
  })
  res.status(201).json(city)
})

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    res.status(400).json({ error: 'invalid id' })
    return
  }

  try {
    await prisma.city.delete({ where: { id } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: 'city not found' })
  }
})

router.post('/:id/sync', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    res.status(400).json({ error: 'invalid id' })
    return
  }

  const city = await prisma.city.findUnique({ where: { id } })
  if (!city) {
    res.status(404).json({ error: 'city not found' })
    return
  }

  try {
    const weather = await fetchWeatherForCity(city.latitude, city.longitude)
    await prisma.weather.create({
      data: {
        cityId: city.id,
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        weatherCode: weather.weatherCode,
        rawData: weather,
      },
    })
    await prisma.syncLog.create({ data: { success: true } })
    res.json({ synced: 1 })
  } catch {
    await prisma.syncLog.create({ data: { success: false } })
    res.status(500).json({ error: 'sync failed' })
  }
})

export default router
