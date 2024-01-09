import { z } from 'zod'

export const env = z
  .object({
    ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.string().default('3000'),
    HOST: z.string().default('http://localhost:3000'),

    RESPONSE_TIMEOUT_MS: z.string().default('5000').transform(Number),
    RESPONSE_MAX_RETRIES: z.string().default('1').transform(Number),
    RESPONSE_AMOUNT: z.string().default('1').transform(Number),

    RPC_FEED_CRON: z.string().default('*/15'),
  })
  .parse(Bun.env)
