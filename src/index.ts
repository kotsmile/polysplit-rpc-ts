import { attachRouting } from 'express-zod-api'

import { config } from '@/config'
import { routing } from '@/routing'

// init crons
import { proxyCheckCron } from '@/crons/proxy-check'
import { rpcFeedCron } from '@/crons/rpc-feed'

import { expressApp } from '@/app'

import { env } from '@/env'
import { logger } from '@/utils'

proxyCheckCron().then(() => rpcFeedCron())

async function main() {
  const { notFoundHandler } = attachRouting(config, routing)
  expressApp.use(notFoundHandler) // optional
  expressApp.listen(env.PORT)
}

main().catch(logger.error)
