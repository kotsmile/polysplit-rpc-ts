import { attachRouting } from 'express-zod-api'

import { config } from '@/config'
import { routing } from '@/routing'

import { proxyService, rpcService, statsService, storageRepo } from '@/impl'

import { expressApp } from '@/app'

import { env } from '@/env'
import { logger } from '@/utils'

// init crons
import { rpcFeedCron } from '@/crons/rpc-feed'
import '@/crons/rpc-feed'
import '@/crons/stats-saving'
import '@/crons/stats-rotation'
import { statsSavingCron } from '@/crons/stats-saving'

proxyService.initProxies().then((val) => {
  if (val.err) {
    console.error(val.val)
  }
  return rpcFeedCron()
})

async function initRpcs() {
  logger.info('initiating rpcs')

  // add all rpcs
  const allRpcs = await rpcService.fetchAllRpcs()
  if (allRpcs.err) {
    logger.error(`no rpcs was fetched: ${allRpcs.val}`)
    return
  }

  for (const chainId of env.SUPPORTED_CHAIN_IDS) {
    const rpcs = allRpcs.val[chainId] ?? []

    const response = await rpcService.setRpcs(chainId, rpcs)
    if (response.err) {
      logger.warn(`failed to set rpcs for chainId ${chainId}`)
      continue
    }
  }
  logger.debug('add optimistic rpcs')

  // set popular rpc

  for (const chainId of env.SUPPORTED_CHAIN_IDS) {
    // TODO(@kotsmile): make get popular function target all chains to speed up
    const rpc = await statsService.getPopularRpcForChainId(chainId)
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

    if (typeof rpc.val.val !== 'string') {
      continue
    }

    logger.debug(`popular rpc for chainId ${chainId}: ${rpc.val.val}`)
    const oldRpcs = await rpcService.getRpcs(chainId)
    if (oldRpcs.err) {
      const response = await rpcService.setRpcs(chainId, [rpc.val.val])
      if (response.err) {
        logger.warn(`failed to set rpcs for chainId ${chainId}`)
        continue
      }
    } else {
      const response = await rpcService.setRpcs(chainId, [rpc.val.val])
      if (response.err) {
        logger.warn(`failed to set rpcs for chainId ${chainId}`)
        continue
      }
    }
  }

  logger.info('initiating rpcs done')
}

async function main() {
  const { notFoundHandler } = await attachRouting(config, routing)
  expressApp.use(notFoundHandler) // optional
  expressApp.listen(env.PORT).close(async () => {
    await statsSavingCron()
    await storageRepo.disconnect()
  })

  await initRpcs()
}

main().catch(logger.error)
