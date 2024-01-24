import { InternalServerError, NotFoundError } from 'elysia'

import { app } from '@/app'
import { proxyRpcRequest } from '@/services/blockchain'

import { getProxies, getRpcs } from '@/services/cache'

import { logger, randomElement } from '@/utils'
import { env } from '@/env'

app.post('/v1/chain/:id', async ({ body, params }) => {
  if (!env.SUPPORTED_CHAIN_IDS.includes(params.id)) {
    throw new NotFoundError('Unsupported chainId')
  }

  const rpcs = await getRpcs(params.id)
  const randomProxy = (await getProxies())
    .andThen((v) => randomElement(v).toResult(''))
    .unwrapOr(undefined)

  for (const url of rpcs) {
    const response = await proxyRpcRequest(url, body, undefined, randomProxy)
    if (response.err) {
      logger.error(`failed to request RPC ${url}: ${response.val.message}`)
      continue
    }
    logger.debug(`Success: chainId ${params.id} with rpc: ${url}`)
    return response.val
  }

  logger.error(`failed to request all RPCs`)
  throw new InternalServerError('Failed to request RPC')
})
