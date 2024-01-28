import { z } from 'zod'
import { defaultEndpointsFactory } from 'express-zod-api'
import createHttpError from 'http-errors'

import { statsService } from '@/impl'
import { StatsPerChainSchema } from '@/services/stats'
import { logger } from '@/utils'

export default defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    chainId: z.string(),
  }),
  output: StatsPerChainSchema,
  async handler({ input }) {
    const stats = await statsService.getStatisticOfUsageForChainId(
      input.chainId
    )
    if (stats.err) {
      logger.error(
        `failed to get stats for chainId ${input.chainId}: ${stats.val}`
      )
      throw createHttpError.InternalServerError('Internal error')
    }

    return stats.val
  },
})
