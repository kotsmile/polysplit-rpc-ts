import { createConfig } from 'express-zod-api'

import { expressApp } from '@/app'

import { logger } from '@/utils'

export const config = createConfig({
  app: expressApp,
  startupLogo: false,
  cors: true,
  logger,
})
