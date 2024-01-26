import { z } from 'zod'

export const env = z
  .object({
    PORT: z.string().default('3000'),

    RESPONSE_TIMEOUT_MS: z.string().default('5000').transform(Number),
    RESPONSE_MAX_RETRIES: z.string().default('1').transform(Number),
    RESPONSE_AMOUNT: z.string().default('1').transform(Number),

    RPC_FEED_CRON: z.string().default('*/1'),
    PROXY_CHECK_CRON: z.string().default('*/30'),

    SUPPORTED_CHAIN_IDS: z
      .string()
      .default('56')
      .transform((v) => v.split(',')),

    PROXYSELLER_API_KEY: z.string(),

    MONGO_DB_URL: z.string(),
    MONGO_DB_NAME: z.string(),
    MONGO_DB_STATS_COLLECTION: z.string(),
  })
  .parse(Bun.env)
