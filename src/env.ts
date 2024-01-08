import zennv from 'zennv'
import { z } from 'zod'

export const env = zennv({
  dotenv: true,
  schema: z.object({
    ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.string().default('3000'),
    HOST: z.string().default('http://localhost:3000'),

    RESPONSE_TIMEOUT_MS: z.string().default('3000').transform(Number),
    RESPONSE_MAX_RETRIES: z.string().default('3').transform(Number),
  }),
})
