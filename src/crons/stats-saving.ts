import { statsService } from '@/impl'
import { createAndRunCronJob, logger } from '@/utils'

createAndRunCronJob('*/1 * * * *', async () => {
  logger.info('cron stats saving')
  const response = await statsService.saveStats()
  if (response.err) {
    logger.error(response.val)
    return false
  }
  logger.info('cron stats saving done')
  return true
})
