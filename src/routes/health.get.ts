import { defaultEndpointsFactory, withMeta } from 'express-zod-api'
import { z } from 'zod'
export default defaultEndpointsFactory.build({
  method: 'get',
  tags: ['Default'],
  shortDescription: 'Status of server',
  input: z.object({}),
  output: withMeta(z.object({ status: z.string() })).example({
    status: 'healthy',
  }),
  async handler() {
    return { status: 'healthy' }
  },
})
