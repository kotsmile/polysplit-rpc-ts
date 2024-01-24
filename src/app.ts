import { Elysia } from 'elysia'
import { cron } from '@elysiajs/cron'

import { env } from '@/env'

import { rpcFeedCron } from '@/crons/rpc-feed'
import { proxyCheckCron } from '@/crons/proxy-check'
// import { fetchProxies } from './services/proxy'
// import { setProxies, setRpcs } from './services/cache'
// import { getChainConfig } from './services/localStorage'

// async function initStart() {
//   // proxies
//   const proxies = await fetchProxies(true)
//   await setProxies(proxies.unwrap())
//
//   // chains
//   for (const chainId of env.SUPPORTED_CHAIN_IDS) {
//     const chainConfig = getChainConfig(chainId).unwrap()
//     await setRpcs(chainId, chainConfig.rpcs)
//   }
// }

// initStart()
proxyCheckCron().then(() => rpcFeedCron())

export const app = new Elysia()
  .use(
    cron({
      name: 'proxy',
      pattern: `${env.PROXY_CHECK_CRON} * * * *`,
      async run() {
        await proxyCheckCron()
      },
    })
  )
  .use(
    cron({
      name: 'rpc-feed',
      pattern: `${env.RPC_FEED_CRON} * * * *`,
      async run() {
        await rpcFeedCron()
      },
    })
  )
