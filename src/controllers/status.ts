import { app } from '@/app'
import { t } from 'elysia'

app.get(
  '/health',
  async () => {
    return 'Healthy'
  },
  { body: t.String() }
)
