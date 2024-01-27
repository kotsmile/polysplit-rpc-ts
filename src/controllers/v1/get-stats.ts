import { z } from 'zod'
import { createHttpError, defaultEndpointsFactory } from 'express-zod-api'

import { statsService } from '@/impl'
import { StatsPerChainSchema, StatsSharedSchema } from '@/services/stats'

export default defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({
    shared: StatsSharedSchema,
    perChainId: z.record(z.string(), StatsPerChainSchema),
  }),
  async handler() {
    const stats = await statsService.getStatisticOfUsage()
    if (stats.err) {
      throw createHttpError(500, 'Internal error')
    }

    return stats.val
  },
})
