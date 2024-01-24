import { setProxies } from '@/services/cache'
import { fetchProxies } from '@/services/proxy'

import { logger } from '@/utils'

export async function proxyCheckCron() {
  logger.info('Updating proxy info')

  const proxies = await fetchProxies()
  if (proxies.err) {
    logger.error('Failed to fetch proxies:', proxies.val)
    return
  }

  const response = await setProxies(proxies.val)
  if (response.err) {
    logger.error('Failed to save proxies', proxies.val)
  }

  logger.info('Proxies are saved', proxies.val.length)
}
