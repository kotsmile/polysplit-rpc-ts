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

const chainsMainnet = [
  '1',
  '56',
  '42161',
  '43114',
  '10',
  '1088',
  '137',
  '8453',
  '25',
  '100',
  '8217',
  '42220',
  '5000',
  '369',
  '250',
  '59144',
  '66',
]
const chainsTestnet = [
  '5',
  '420',
  '599',
  '421613',
  '84531',
  '338',
  '10200',
  '97',
  '65',
  '80001',
  '1101',
  '4002',
  '943',
  '5001',
  '1001',
  '44787',
  '62320',
  '43113',
  '59140',
]
const chainsPop = [...chainsMainnet, ...chainsTestnet]

// https://github.com/ethereum-lists/chains.git
async function main() {
  const chains: { chainId: string; name: string; rpcs: string[] }[] = []

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
    if (!chainsPop.includes(chain.data.chainId.toString())) {
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

    chains.push({
      chainId: chainId.toString(),
      name,
      rpcs: rpcs
        .filter((r) => r.startsWith('https'))
        .filter((r) => !r.includes('{'))
        .filter((r) => !r.includes('}')),
    })
  }
  fs.writeFileSync(
    targetPath,
    JSON.stringify(
      chains.sort((c1, c2) => parseInt(c1.chainId) - parseInt(c2.chainId))
    )
  )
}

if (import.meta.main) {
  await main()
}
