import { Routing } from 'express-zod-api'
import { expressApp } from '@/app'

import getStatusController from '@/controllers/get-status'
import getStatsController from '@/controllers/v1/get-stats'
import { postChainControllerV1 } from '@/controllers/v1/post-chain'

export const routing: Routing = {
  status: getStatusController,
  v1: {
    stats: getStatsController,
  },
}

expressApp.post('/v1/chain/:chainId', postChainControllerV1)
