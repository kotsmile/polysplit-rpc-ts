import { createServer } from 'express-zod-api'

import { config } from '@/config'
import { routing } from '@/routing'

import '@/crons'

// start http server
createServer(config, routing)
