import { Err, Ok } from 'ts-results'
import type { Result } from 'ts-results'
import { Chain, Rpc } from '@prisma/client'

import { prisma } from '@/services/db'
import type { DbError } from '@/services/db'

import { safe } from '@/utils'

export async function getChainById(
  chainId: string
): Promise<Result<Chain & { rpcs: Rpc[] }, DbError>> {
  const response = await safe(
    prisma.chain.findUnique({ where: { id: chainId }, include: { rpcs: true } })
  )

  if (response.err) {
    return Err({
      type: 'ERROR',
      message: `failed to get chain with chainId ${chainId}`,
    })
  }

  if (response.val === null) {
    return Err({
      type: 'NOT_FOUND',
      message: `chain with chainId ${chainId} does not exist`,
    })
  }

  return Ok(response.val)
}
