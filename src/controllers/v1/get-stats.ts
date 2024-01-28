import { z } from 'zod'
import { defaultEndpointsFactory } from 'express-zod-api'
import createHttpError from 'http-errors'

import { statsService } from '@/impl'
import { StatsSharedSchema } from '@/services/stats'
import { logger } from '@/utils'

export default defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: StatsSharedSchema,
  async handler() {
    const stats = await statsService.getStatisticOfUsageShared()
    if (stats.err) {
      logger.error(`failed to get stats for shared: ${stats.val}`)
      throw createHttpError.InternalServerError('Internal error')
    }

    return stats.val
  },
})
