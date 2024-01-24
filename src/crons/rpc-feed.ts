import { z } from 'zod'
import axios from 'axios'

import { setRpcs } from '@/services/cache'

import { env } from '@/env'
import { logger, randomElement, safe, timePromise } from '@/utils'
import { getChainsWithRpcs } from '@/services/localStorage'
import { getProxies } from '@/services/proxy'

const axiosTimeout = axios.create({ timeout: env.RESPONSE_TIMEOUT_MS })

export async function rpcFeedCron() {
  logger.info('Collecting RPC Feed')
  const chains = getChainsWithRpcs()

  const BATCH_SIZE = 10
  for (let i = 0; i < chains.length - BATCH_SIZE; i += BATCH_SIZE) {
    await Promise.all(
      chains.slice(i, i + BATCH_SIZE).map(async (chain) => {
        if (chain.rpcs.length === 0) {
          logger.warn(`Skip ${chain.chainId} zero length rpcs`)
          return
        }

        const metrics = await Promise.all(
          chain.rpcs.map(async (rpc) => ({
            metrics: await checkEvmRpc(chain.chainId, rpc),
            rpc,
          }))
        )

        const sortedOkMetrics = metrics
          .filter((rpc) => rpc.metrics.status === 'ok')
          .toSorted(
            (r1, r2) => r1.metrics.responseTime - r2.metrics.responseTime
          )

        if (sortedOkMetrics.length === 0) {
          logger.warn(`Bad rpc chainId: ${chain.chainId}, ${chain.name}`)
          return
        }

        const topRpcs = sortedOkMetrics.map((r) => r.rpc)
        const response = await setRpcs(chain.chainId, topRpcs)
        if (response.err) {
          logger.error(`Failed to store top rpcs: ${response.val}`)
          return
        }

        logger.debug(
          `ChainId: ${chain.chainId}, Best time: ${sortedOkMetrics[0]?.metrics.responseTime}`
        )
      })
    )
  }
  return
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
  const proxies = (await getProxies()).unwrapOr([])

  for (let i = 0; i < env.RESPONSE_AMOUNT; i++) {
    const [response, t] = await timePromise(
      safe(
        axiosTimeout.post(url, eth_chainIdRequest, {
          proxy: randomElement(proxies).unwrapOr(undefined),
        })
      )
    )
    if (response.err) {
      logger.error(response.val, url)
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

  return {
    status: 'ok',
    responseTime,
    errorMessage: '',
  }
}
