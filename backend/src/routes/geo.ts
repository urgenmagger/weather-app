import { Router, Request, Response } from 'express'
import axios from 'axios'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const q = req.query.q

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    res.status(400).json({ error: 'query parameter "q" is required' })
    return
  }

  try {
    const { data } = await axios.get(
      'https://geocoding-api.open-meteo.com/v1/search',
      {
        params: {
          name: q.trim(),
          count: 5,
          language: 'ru',
        },
      }
    )

    const cities = (data.results ?? []).map(
      (r: {
        id: number
        name: string
        country: string
        admin1?: string
        latitude: number
        longitude: number
      }) => ({
        id: r.id,
        name: r.name,
        country: r.country,
        region: r.admin1 ?? null,
        latitude: r.latitude,
        longitude: r.longitude,
      })
    )

    res.json(cities)
  } catch {
    res.status(502).json({ error: 'geocoding service unavailable' })
  }
})

export default router
