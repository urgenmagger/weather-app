import app from './app'
import { startWeatherSync } from './cron/weatherSync'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  startWeatherSync()
})
