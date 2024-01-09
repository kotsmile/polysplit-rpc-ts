import { RpcType } from '@prisma/client'
import { prisma } from '@/services/storage'
import { safe } from '@/utils'

import { extraRpcs } from '@/extraRpcs'

async function main() {
  for (const chainId of Object.keys(extraRpcs)) {
    console.log(chainId)
    const chain = extraRpcs[parseInt(chainId) as keyof typeof extraRpcs]
    const response = await safe(
      prisma.rpc.createMany({
        skipDuplicates: true,
        data: chain.rpcs.map((r) => {
          if (typeof r === 'object' && 'url' in r) {
            return {
              url: r.url,
              chain_id: chainId,
              type: RpcType.HTTPS,
            }
          } else {
            return {
              url: r,
              chain_id: chainId,
              type: RpcType.HTTPS,
            }
          }
        }),
      })
    )
    if (response.err) {
      console.error(`error to add to rpc: ${response.val.message}`)
    }
  }
}

if (import.meta.main) {
  await main()
}
