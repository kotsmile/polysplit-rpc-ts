import { z } from 'zod'
import axios from 'axios'
import type { Rpc } from '@prisma/client'

import { getChainsWithRpcs } from '@/services/storage'
import { setRpcs } from '@/services/cache'

import { env } from '@/env'
import { createAndRunCronJob, logger, safe, timePromise } from '@/utils'

const axiosTimeout = axios.create({ timeout: env.RESPONSE_TIMEOUT_MS })

createAndRunCronJob(
  `${env.RPC_FEED_CRON} * * * *`,
  async (): Promise<boolean> => {
    const chains = await getChainsWithRpcs()
    if (chains.err) {
      logger.error(`Failed to get chains: ${chains.val}`)
      return false
    }

    for (const chain of chains.val) {
      if (chain.type !== 'EVM') {
        logger.error(`Not supported chain.type ${chain.type}`)
        continue
      }

      const metrics = await Promise.all(
        chain.rpcs.map(async (rpc) => ({
          metrics: await checkEvmRpc(chain.id, rpc),
          ...rpc,
        }))
      )

      const sortedOkMetrics = metrics
        .filter((rpc) => rpc.metrics.status === 'ok')
        .toSorted((r1, r2) => r1.metrics.responseTime - r2.metrics.responseTime)

      const topRpcs = sortedOkMetrics.map((r) => r.url)
      const response = await setRpcs(chain.id, topRpcs)
      if (response.err) {
        logger.error(`Failed to store top rpcs: ${response.val}`)
        continue
      }
    }

    return true
  }
)

type RpcMetrics = {
  status: 'ok' | 'error'
  responseTime: number
  errorMessage: string
}

async function checkEvmRpc(chainId: string, rpc: Rpc): Promise<RpcMetrics> {
  const eth_chainIdRequest = {
    method: 'eth_chainId',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  }
  const ResponseSchema = z.object({
    jsonrpc: z.literal('2.0'),
    id: z.literal('1'),
    result: z.string(),
  })

  let totalTime = 0
  let failed = 0
  for (let i = 0; i < env.RESPONSE_AMOUNT; i++) {
    const [response, t] = await timePromise(
      safe(axiosTimeout.post(rpc.url, eth_chainIdRequest))
    )
    if (response.err) {
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

  if (failed > 1) {
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
