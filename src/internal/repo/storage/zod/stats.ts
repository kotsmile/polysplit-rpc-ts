import * as z from 'zod'
import { StatsStatus } from '@prisma/client'

export const StatsModel = z.object({
  id: z.number().int(),
  chainId: z.string(),
  status: z.nativeEnum(StatsStatus),
  responseTimeMs: z.number().int(),
  choosenRpc: z.string(),
  ip: z.string().nullish(),
  isLanding: z.boolean(),
  attempts: z.number().int(),
  errorMessage: z.string().nullish(),
  created_at: z.date(),
})
