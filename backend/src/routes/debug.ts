import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.post('/set-unavailable', async (_req, res) => {
  await prisma.syncLog.create({ data: { success: false } })
  res.json({ ok: true })
})

export default router
