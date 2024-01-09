
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const ChainSchema = z.object({
  name: z.string(),
  rpc: z.array(z.string()),
  slip44: z.number().default(-1),
  chainId: z.number(),
})

import { extraRpcs, llamaNodesRpcs } from '@/extraRpcs'

// https://github.com/ethereum-lists/chains.git
async function main() {
  const chains: Record<string, { name: string, rpcs: string[] }> = {}

  const folderPath = './chainlist-chains/_data/chains'
  const targetPath = './src/services/localStorage/chains.json'
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

    const { chainId, rpc, name } = chain.data

    const rpcs: string[] = [...rpc]
    const chainExtraRpc = extraRpcs[chainId as keyof typeof extraRpcs]
    if (chainExtraRpc !== undefined) {
      for (const rpc of chainExtraRpc.rpcs) {
        if (typeof rpc === 'object' && 'url' in rpc) {
          rpcs.push(rpc.url)
        } else {
          rpcs.push(rpc)
        }
      }
    }

    const chainLlamaRpc = llamaNodesRpcs[chainId as keyof typeof llamaNodesRpcs]
    if (chainLlamaRpc !== undefined) {
      for (const rpc of chainLlamaRpc.rpcs) {
        if (typeof rpc === 'object' && 'url' in rpc) {
          rpcs.push(rpc.url)
        } else {
          rpcs.push(rpc)
        }
      }
    }

    chains[chainId.toString()] = {
      name,
      rpcs
    }
  }
  fs.writeFileSync(targetPath, JSON.stringify(chains))
}



if (import.meta.main) {
  await main()
}
