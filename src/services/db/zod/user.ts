import * as z from 'zod'

export const UserModel = z.object({
  email: z.string(),
  hash_password: z.string().nullish(),
  api_token: z.string(),
  total_usage: z.number().int(),
  created_at: z.date(),
  updated_at: z.date(),
})
