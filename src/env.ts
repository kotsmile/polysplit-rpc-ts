import zennv from 'zennv'
import { z } from 'zod'

export const env = zennv({
  dotenv: true,
  schema: z.object({
    PORT: z.string().default('3000'),
    ENV: z.enum(['production', 'development']).default('production'),
    HOST: z.string().default('https://rpc.polysplit.cloud'),

    RESPONSE_TIMEOUT_MS: z.string().default('5000').transform(Number),
    RESPONSE_MAX_RETRIES: z.string().default('1').transform(Number),
    RESPONSE_AMOUNT: z.string().default('1').transform(Number),

    RPC_FEED_CRON: z.string().default('*/1'),
    PROXY_CHECK_CRON: z.string().default('*/30'),

    SUPPORTED_CHAIN_IDS: z
      .string()
      .default(
        '1,5,10,56,97,137,250,369,420,943,1001,1101,4002,5000,8217,8453,42161,43113,43114,59140,59144,80001,84531,421613'
      )
      .transform((v) => v.split(',')),

    PROXYSELLER_API_KEY: z.string(),

    MONGO_DB_URL: z.string(),
    MONGO_DB_NAME: z.string(),
    MONGO_DB_STATS_COLLECTION: z.string(),
  }),
})
