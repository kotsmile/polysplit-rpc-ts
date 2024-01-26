import { attachRouting } from 'express-zod-api'

import { config } from '@/config'
import { routing } from '@/routing'

// init crons
import { rpcFeedCron } from '@/crons/rpc-feed'

import { proxyService } from '@/impl'

import { expressApp } from '@/app'

import { env } from '@/env'
import { logger } from '@/utils'

proxyService.initProxies().then((val) => {
  if (val.err) {
    console.error(val.val)
  }
  return rpcFeedCron()
})

async function main() {
  const { notFoundHandler } = attachRouting(config, routing)
  expressApp.use(notFoundHandler) // optional
  expressApp.listen(env.PORT)
}

main().catch(logger.error)
