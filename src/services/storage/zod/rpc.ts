import * as z from 'zod'
import { RpcType } from '@prisma/client'
import { CompleteChain, RelatedChainModel } from './index'

export const RpcModel = z.object({
  id: z.string(),
  chain_id: z.string(),
  type: z.nativeEnum(RpcType),
  url: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CompleteRpc extends z.infer<typeof RpcModel> {
  chain: CompleteChain
}

/**
 * RelatedRpcModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRpcModel: z.ZodSchema<CompleteRpc> = z.lazy(() =>
  RpcModel.extend({
    chain: RelatedChainModel,
  })
)
