import * as z from 'zod'
import { ServiceType, ServiceStatus } from '@prisma/client'

export const ServiceModel = z.object({
  id: z.string(),
  name: z.string(),
  client: z.string(),
  url: z.string(),
  status_response: z.number().int(),
  tags: z.string().array(),
  type: z.nativeEnum(ServiceType),
  enabled: z.boolean(),
  mute_until: z.number().int(),
  checked_at: z.number().int(),
  status: z.nativeEnum(ServiceStatus),
  timeout: z.number().int(),
})
