import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { ChainEnvType, RpcType, ChainType } from '@prisma/client'
import { prisma } from '@/services/storage'
import { safe } from '@/utils'

const ChainSchema = z.object({
  name: z.string(),
  rpc: z.array(z.string()),
  slip44: z.number().default(-1),
  chainId: z.number(),
})

// https://github.com/ethereum-lists/chains.git
async function main() {
  const folderPath = './chainlist-chains/_data/chains'
  const files = fs.readdirSync(folderPath)

  for (const file of files) {
    console.log(file)
    const filePath = path.join(folderPath, file)
    const content = fs.readFileSync(filePath).toString()
    const chain = ChainSchema.safeParse(JSON.parse(content))
    if (!chain.success) {
      console.error(`Failed to proceed ${filePath}: ${chain.error}`)
      continue
    }
    let envType: ChainEnvType = ChainEnvType.MAINNET
    if (chain.data.slip44 === 1) {
      envType = ChainEnvType.TESTNET
    }
    const chainResponse = await safe(
      prisma.chain.create({
        data: {
          id: chain.data.chainId.toString(),
          type: ChainType.EVM,
          env_type: envType,
        },
      })
    )

    if (chainResponse.err) {
      console.error(
        `Failed to create record in chain: ${chainResponse.val.message}`
      )
      continue
    }

    const rpcResponse = await safe(
      prisma.rpc.createMany({
        skipDuplicates: true,
        data: chain.data.rpc.map((url) => ({
          chain_id: chain.data.chainId.toString(),
          url,
          type: RpcType.HTTPS,
        })),
      })
    )
    if (rpcResponse.err) {
      console.error(
        `Failed to create record in rpc: ${rpcResponse.val.message}`
      )
      continue
    }
  }
}

if (import.meta.main) {
  await main()
}
