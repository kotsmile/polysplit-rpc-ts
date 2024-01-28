import { proxyService } from '@/impl'
import { createAndRunCronJob, logger } from '@/utils'

createAndRunCronJob('*/5 * * * *', async () => {
  logger.info('cron proxy rotation start')
  const response = await proxyService.rotateProxy()
  logger.info('cron proxy rotation done')
  return response
})
