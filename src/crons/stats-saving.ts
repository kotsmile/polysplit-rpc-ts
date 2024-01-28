import { statsService } from '@/impl'
import { createAndRunCronJob, logger } from '@/utils'

export async function statsSavingCron(): Promise<boolean> {
  logger.info('Stats saving')
  const response = await statsService.saveStats()
  if (response.err) {
    logger.error(response.val)
    return false
  }
  logger.info('stats saving done')
  return true
}

createAndRunCronJob('*/5 * * * *', statsSavingCron)
