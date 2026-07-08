import express from 'express'
import cors from 'cors'
import citiesRouter from './routes/cities'

const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/cities', citiesRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export default app
