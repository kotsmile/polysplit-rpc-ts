import chains from './chains.json'

export type ChainConfig = {
  chainId: string
  name: string
  rpcs: string[]
}

export function getChainsWithRpcs(): ChainConfig[] {
  return chains
}
