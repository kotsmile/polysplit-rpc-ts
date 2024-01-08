import * as z from 'zod'
import { CompleteRpc, RelatedRpcModel } from './index'

export const ChainModel = z.object({
  id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CompleteChain extends z.infer<typeof ChainModel> {
  rpcs: CompleteRpc[]
}

/**
 * RelatedChainModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedChainModel: z.ZodSchema<CompleteChain> = z.lazy(() =>
  ChainModel.extend({
    rpcs: RelatedRpcModel.array(),
  })
)
