import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const cities = await prisma.city.findMany({
    include: {
      weather: {
        orderBy: { fetchedAt: 'desc' },
        take: 1,
      },
    },
  })
  res.json(cities)
})

router.post('/', async (req: Request, res: Response) => {
  const { name, latitude, longitude } = req.body
  const city = await prisma.city.create({
    data: { name, latitude, longitude },
  })
  res.status(201).json(city)
})

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  await prisma.city.delete({ where: { id: Number(id) } })
  res.status(204).send()
})

export default router
