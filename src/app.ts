import { Elysia } from 'elysia'
import { cron } from '@elysiajs/cron'

import { env } from '@/env'

import { rpcFeedCron } from '@/crons/rpc-feed'

rpcFeedCron()

export const app = new Elysia().use(
  cron({
    name: 'rpc-feed',
    pattern: `${env.RPC_FEED_CRON} * * * *`,
    async run() {
      await rpcFeedCron()
    },
  })
)
