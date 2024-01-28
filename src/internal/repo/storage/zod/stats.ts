import * as z from 'zod'

export const StatsModel = z.object({
  id: z.number().int(),
  chainId: z.string(),
  date: z.date(),
  responseTimeMs: z.number().int(),
  chooseRpc: z.string(),
  ip: z.string(),
  isLanding: z.boolean(),
  attempts: z.number().int(),
})
