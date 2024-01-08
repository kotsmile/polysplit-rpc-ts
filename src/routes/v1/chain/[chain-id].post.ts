import { createHttpError, defaultEndpointsFactory } from 'express-zod-api'
import { z } from 'zod'
import axios from 'axios'

import { getChainById } from '@/services/db/chain'
import { HttpStatus, logger, safe } from '@/utils'

export default defaultEndpointsFactory.build({
  method: 'get',
  tags: ['Service'],
  shortDescription: 'Returns list of services',
  input: z
    .object({
      'chain-id': z.string(),
    })
    .passthrough(),
  output: z.any(),
  async handler({ input }) {
    const chain = await getChainById(input['chain-id'])
    if (chain.err) {
      logger.error(`failed to find chain: ${chain.val}`)
      switch (chain.val.type) {
        case 'NOT_FOUND':
          throw createHttpError(HttpStatus.BAD_REQUEST, 'Wrong [chain-id]')
        case 'ERROR':
          throw createHttpError(HttpStatus.INTERNAL, 'Internal error')
      }
    }

    const rpc = chain.val.rpcs[0]?.url ?? 'https://error.com'
    const body: Partial<typeof input> = input
    delete body['chain-id']

    logger.debug(`Requesting ${chain.val.id} to ${rpc} with body: ${body}`)

    const response = await safe(axios.post(rpc, body))

    return response.data
  },
})
