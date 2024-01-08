import { app } from '@/app'
import { env } from '@/env'

import '@/routes'

if (import.meta.main) {
  app.listen(env.PORT)
}
