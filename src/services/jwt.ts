import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Err } from 'ts-results'
import type { Result } from 'ts-results'

import { parseData } from '@/utils'

const PayloadSchema = z.object({
  email: z.string(),
  roles: z.array(z.string()),
})
type Payload = z.infer<typeof PayloadSchema>

export function createJWT(payload: Payload): string {
  return jwt.sign(payload, 'jwt-secret', {
    expiresIn: 'jwt-expires',
  })
}

export function verifyJWT(token: string): Result<Payload, Error> {
  try {
    return parseData(jwt.verify(token, 'jwt-secret'), PayloadSchema)
  } catch (error) {
    if (error instanceof Error) {
      return Err(error)
    } else {
      return Err(new Error(JSON.stringify(error)))
    }
  }
}
