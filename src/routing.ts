import { Routing } from 'express-zod-api'
import { expressApp } from '@/app'

import getStatusController from '@/controllers/get-status'
import { postChainControllerV1 } from '@/controllers/v1/post-chain'

export const routing: Routing = {
  status: getStatusController,
  v1: {},
}

expressApp.post('/v1/chain/:chainId', postChainControllerV1)
