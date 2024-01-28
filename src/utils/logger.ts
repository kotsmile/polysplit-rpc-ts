import { Logger } from 'tslog'

import { env } from '@/env'

export const logger = new Logger({
  maskValuesOfKeys: Object.keys(env),
  minLevel: 3,
})
