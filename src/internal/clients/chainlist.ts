import { safe } from '@/utils'
import axios from 'axios'
import { Ok, Result } from 'ts-results'

export class ChainlistClient {
  constructor() {}

  async fetchRpcs(): Promise<Result<Record<string, string[]>, string>> {
    const file = await safe(
      axios.get<string>(
        'https://raw.githubusercontent.com/DefiLlama/chainlist/main/constants/extraRpcs.js'
      )
    )
    if (file.err) {
      return file
    }

    const lines = file.val.data.split('\n')
    const targetStartLine = 'export const extraRpcs = {'
    const targetStopLine =
      'const allExtraRpcs = mergeDeep(llamaNodesRpcs, extraRpcs);'
    const startLine = lines.findIndex((line) => line === targetStartLine)
    const stopLine = lines.findIndex((line) => line === targetStopLine)

    const targetLines = lines
      .slice(startLine, stopLine)
      .filter((line) => !line.trim().startsWith('//'))
      .filter((line) => !line.trim().startsWith('trackingDetails:'))
      .filter((line) => !line.trim().startsWith('tracking:'))

    const extraRpcs: Record<string, unknown> = {}
    // TODO(@kotsmile) fix eval to risky
    eval(
      targetLines
        .join('\n')
        .replace(/export const extraRpcs = /, 'extraRpcs = ')
    )

    const allRpcs: Record<string, string[]> = {}

    for (const chainId of Object.keys(extraRpcs)) {
      const chain = extraRpcs[chainId]
      if (typeof chain === 'object' && chain !== null && 'rpcs' in chain) {
        const rpcs = chain.rpcs as (string | { url: string })[]
        for (const rpc of rpcs) {
          const url = (() => {
            if (typeof rpc === 'string') {
              return rpc
            } else {
              return rpc.url
            }
          })()

          if (url === 'rpcWorking:false') {
            continue
          }

          if (url.startsWith('https://rpc.polysplit.cloud')) {
            continue
          }

          if (allRpcs[chainId] === undefined) {
            allRpcs[chainId] = []
          }

          allRpcs[chainId]?.push(url)
        }
      }
    }

    return Ok(allRpcs)
  }
}
