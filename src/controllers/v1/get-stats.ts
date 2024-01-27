import { z } from 'zod'
import { defaultEndpointsFactory } from 'express-zod-api'

export default defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({}),
  async handler() {
    return {}
  },
})
