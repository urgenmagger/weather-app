import { Router } from 'express'
import { syncAllCities } from '../services/weather'
import prisma from '../lib/prisma'

const router = Router()

router.post('/', async (_req, res) => {
  try {
    const results = await syncAllCities()
    await prisma.syncLog.create({ data: { success: true } })
    res.json({ synced: results.length })
  } catch (err) {
    await prisma.syncLog.create({ data: { success: false } })
    res.status(500).json({ error: 'sync failed' })
  }
})

export default router
