import express from 'express'
import cors from 'cors'
import citiesRouter from './routes/cities'
import syncRouter from './routes/sync'
import geoRouter from './routes/geo'
import debugRouter from './routes/debug'

const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5174' }))
app.use(express.json())

app.use('/api/cities', citiesRouter)
app.use('/api/sync', syncRouter)
app.use('/api/geo', geoRouter)
app.use('/api/debug', debugRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export default app
