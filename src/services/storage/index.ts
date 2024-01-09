import { PrismaClient } from '@prisma/client'
import type { Chain, Rpc } from '@prisma/client'
// import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'

import { safe } from '@/utils'

export type DbErrorType = 'notfound' | 'internal'
export type DbError = {
  type: DbErrorType
  message: string
}

export const prisma = new PrismaClient()

export async function getChainsWithRpcs(): Promise<
  Result<(Chain & { rpcs: Rpc[] })[], DbError>
> {
  const response = await safe(
    prisma.chain.findMany({
      include: {
        rpcs: true,
      },
      // where: { id: '1' },
    })
  )
  return response.mapErr((err) => ({
    type: 'internal',
    message: `failed to request database: ${err.message}`,
  }))
}
