import { proxyService } from '@/impl'

import { env } from '@/env'
import { createAndRunCronJob, logger } from '@/utils'

export async function proxyCheckCron() {
  logger.info(`proxy check started`)

  const response = await proxyService.initProxies()
  if (response.err) {
    logger.error(`failed to init proxies: ${response.val}`)
    return false
  }

  logger.info('proxy check done')
  return true
}

createAndRunCronJob(`${env.PROXY_CHECK_CRON} * * * *`, proxyCheckCron)
