import axios from 'axios'

import { app } from '@/app'
import { logger, safe } from '@/utils'
import { InternalServerError } from 'elysia'

app.post('/v1/chain/:id', async ({ body }) => {
  const rpc = 'https://eth.llamarpc.com'

  console.log('Request body', body)
  const response = await safe(axios.post(rpc, body))
  if (response.err) {
    logger.error(`failed to request RPC ${rpc}: ${response.val.message}`)
    throw new InternalServerError('Failed to request RPC')
  }

  console.log('Response', response.val.data)

  return response.val.data
})
