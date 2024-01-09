import { InternalServerError } from 'elysia'

import { app } from '@/app'
import { proxyRpcRequest } from '@/services/blockchain'

import { logger } from '@/utils'
import { getRpcs } from '@/services/cache'

app.post('/v1/chain/:id', async ({ body, params }) => {
  const rpcs = await getRpcs(params.id)

  for (const url of rpcs) {
    const response = await proxyRpcRequest(url, body)
    if (response.err) {
      logger.error(`failed to request RPC ${url}: ${response.val.message}`)
      continue
    }
    return response.val
  }

  logger.error(`failed to request all RPCs`)
  throw new InternalServerError('Failed to request RPC')
})
