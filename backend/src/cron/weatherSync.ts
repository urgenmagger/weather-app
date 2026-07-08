import cron from 'node-cron'
import { syncAllCities } from '../services/weather'

const cronExpression = process.env.WEATHER_SYNC_CRON || '*/15 * * * *'

export function startWeatherSync(): void {
  console.log(`Weather sync scheduled with cron: ${cronExpression}`)

  cron.schedule(cronExpression, async () => {
    console.log('Running weather sync...')
    try {
      const results = await syncAllCities()
      console.log(`Synced weather for ${results.length} cities`)
    } catch (err) {
      console.error('Weather sync failed:', err)
    }
  })

  syncAllCities()
    .then((results) => console.log(`Initial sync: ${results.length} cities`))
    .catch((err) => console.error('Initial sync failed:', err))
}
