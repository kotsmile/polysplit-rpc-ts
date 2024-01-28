import { statsService } from '@/impl'
import { createAndRunCronJob, logger } from '@/utils'

createAndRunCronJob('0 */10 * * *', async () => {
  logger.info('cron start stats rotation')
  const response = await statsService.rotate().then((v) => v.ok)
  logger.info('cron start stats done')
  return response
})
