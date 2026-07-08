import cron from 'node-cron'
import prisma from '../lib/prisma'
import { syncAllCities } from '../services/weather'

const cronExpression = process.env.WEATHER_SYNC_CRON || '*/15 * * * *'

async function runSync(): Promise<void> {
  console.log('Running weather sync...')
  try {
    const results = await syncAllCities()
    await prisma.syncLog.create({ data: { success: true } })
    console.log(`Synced weather for ${results.length} cities`)
  } catch (err) {
    await prisma.syncLog.create({ data: { success: false } })
    console.error('Weather sync failed:', err)
  }
}

export function startWeatherSync(): void {
  console.log(`Weather sync scheduled with cron: ${cronExpression}`)
  cron.schedule(cronExpression, runSync)
  runSync()
}
