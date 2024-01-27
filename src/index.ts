import { attachRouting } from 'express-zod-api'

import { config } from '@/config'
import { routing } from '@/routing'

import { proxyService, rpcService, statsService } from '@/impl'

import { expressApp } from '@/app'

import { env } from '@/env'
import { logger } from '@/utils'

// init crons
import { rpcFeedCron } from '@/crons/rpc-feed'

proxyService.initProxies().then((val) => {
  if (val.err) {
    console.error(val.val)
  }
  return rpcFeedCron()
})

async function initRpcs() {
  logger.info('initiating rpcs')

  for (const chainId of env.SUPPORTED_CHAIN_IDS) {
    const rpc = await statsService.getPopularRpc(chainId)
    if (rpc.err) {
      logger.warn(
        `failed to find popular rpc for chainId ${chainId} ${rpc.val}`
      )
      continue
    }

    if (rpc.val.none) {
      logger.warn(`no popular rpc was found for chainId ${chainId}`)
      continue
    }

    logger.debug(`popular rpc for chainId ${chainId}: ${rpc.val.val}`)
    const response = await rpcService.setRpcs(chainId, [rpc.val.val])
    if (response.err) {
      logger.warn(`failed to set rpcs for chainId ${chainId}`)
      continue
    }
  }

  logger.info('initiating rpcs done')
}

async function main() {
  await initRpcs()

  const { notFoundHandler } = attachRouting(config, routing)
  expressApp.use(notFoundHandler) // optional
  expressApp.listen(env.PORT)
}

main().catch(logger.error)
