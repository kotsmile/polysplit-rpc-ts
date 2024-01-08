import { createConfig } from 'express-zod-api'

import env from '@/env'
import { logger } from '@/utils'

export const config = createConfig({
  startupLogo: false,
  cors: ({ defaultHeaders }) => ({
    ...defaultHeaders,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  }),
  server: {
    listen: env.PORT,
  },
  logger: {
    level: 'debug',
    color: true,

    debug: logger.debug,
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
  },
})
