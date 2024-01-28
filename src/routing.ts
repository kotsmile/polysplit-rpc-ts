import { Routing } from 'express-zod-api'
import { expressApp } from '@/app'

import getStatusController from '@/controllers/get-status'
import getStatsController from '@/controllers/v1/get-stats'
import getStatsChainController from '@/controllers/v1/get-stats-chain'
import { postChainControllerV1 } from '@/controllers/v1/post-chain'
import { timeLimit } from './middlewares/time-limit'

export const routing: Routing = {
  status: getStatusController,
  v1: {
    stats: {
      all: getStatsController,
      ':chainId': getStatsChainController,
    },
  },
}

expressApp.post(
  '/v1/chain/:chainId',
  timeLimit(100, 60 * 1000),
  postChainControllerV1
)
