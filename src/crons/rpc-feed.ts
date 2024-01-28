import { z } from 'zod'

import { proxyService, rpcService } from '@/impl'

import { env } from '@/env'
import {
  createAndRunCronJob,
  logger,
  safeWithError,
  timePromise,
} from '@/utils'

const TEST_BATCH = 10

async function batchPromiseAll(
  batchSize: number,
  promises: Promise<unknown>[]
) {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batchPromises: Promise<unknown>[] = promises.slice(i, i + batchSize)
    await Promise.all(batchPromises)
  }
}

export async function rpcFeedCron() {
  logger.info('Collecting RPC Feed')
  const allRpcs = await rpcService.fetchAllRpcs()
  if (allRpcs.err) {
    logger.error(`no rpcs was found: ${allRpcs.val}`)
    return false
  }

  for (const chainId of env.SUPPORTED_CHAIN_IDS) {
    const rpcs = allRpcs.val[chainId] ?? []

    if (rpcs.length === 0) {
      logger.warn(`Skip ${chainId} zero length rpcs`)
      return false
    }
    logger.info(`rpc length for ${chainId}: ${rpcs.length}`)

    const metrics: { rpc: string; metrics: RpcMetrics }[] = []

    const promises: Promise<unknown>[] = []
    for (const rpc of rpcs) {
      promises.push(
        (async () => {
          metrics.push({
            rpc,
            metrics: await checkEvmRpc(chainId, rpc),
          })
        })()
      )
    }
    await batchPromiseAll(TEST_BATCH, promises)

    const sortedOkMetrics = metrics
      .filter((rpc) => rpc.metrics.status === 'ok')
      .sort((r1, r2) => r1.metrics.responseTime - r2.metrics.responseTime)

    if (sortedOkMetrics.length === 0) {
      logger.warn(`Bad rpc chainId: ${chainId}`)
      return false
    }

    const topRpcs = sortedOkMetrics.map((r) => r.rpc)
    const response = await rpcService.setRpcs(chainId, topRpcs)
    if (response.err) {
      logger.error(`Failed to store top rpcs: ${response.val}`)
      return false
    }

    logger.debug(
      `ChainId: ${chainId}, Best time: ${sortedOkMetrics[0]?.metrics.responseTime}`
    )
  }
  return true
}

type RpcMetrics = {
  status: 'ok' | 'error'
  responseTime: number
  errorMessage: string
}

async function checkEvmRpc(chainId: string, url: string): Promise<RpcMetrics> {
  const eth_chainIdRequest = {
    method: 'eth_chainId',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  }
  const ResponseSchema = z.object({
    jsonrpc: z.literal('2.0'),
    id: z.literal(1),
    result: z.string(),
  })

  let totalTime = 0
  let failed = 0

  for (let i = 0; i < env.RESPONSE_AMOUNT; i++) {
    const [response, t] = await timePromise(
      safeWithError(
        proxyService.proxyPostRequest(
          url,
          eth_chainIdRequest,
          env.RESPONSE_TIMEOUT_MS
        )
      )
    )
    if (response.err) {
      logger.error(response.val.message, url)
      failed++
      continue
    }

    const parsedResponse = ResponseSchema.safeParse(response.val.data)
    if (!parsedResponse.success) {
      failed++
      continue
    }

    const realChainId = parseInt(parsedResponse.data.result.slice(2), 16)
    if (realChainId.toString() !== chainId) {
      failed++
      continue
    }

    totalTime += t
  }

  if (failed > 0) {
    return {
      status: 'error',
      responseTime: Infinity,
      errorMessage: 'Too many failed attempts',
    }
  }

  const responseTime = Math.floor(totalTime / env.RESPONSE_AMOUNT)

  logger.debug(`RPC ${url}: ${responseTime}ms`)
  return {
    status: 'ok',
    responseTime,
    errorMessage: '',
  }
}

createAndRunCronJob(`${env.RPC_FEED_CRON} * * * *`, rpcFeedCron)
