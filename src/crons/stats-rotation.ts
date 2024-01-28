import { statsService } from '@/impl'
import { createAndRunCronJob, logger } from '@/utils'

async function statsRotationCron(): Promise<boolean> {
  logger.info('Start stats rotation')
  const response = await statsService.rotate().then((v) => v.ok)
  logger.info('Start stats done')
  return response
}

createAndRunCronJob('0 */10 * * *', statsRotationCron)
