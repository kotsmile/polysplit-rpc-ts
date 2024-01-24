import { None, Option, Some } from 'ts-results'
import chains from './chains.json'

export type ChainConfig = {
  chainId: string
  name: string
  rpcs: string[]
}

export function getChainConfig(chainId: string): Option<ChainConfig> {
  const chainConfig = chains.filter((c) => c.chainId === chainId)[0]

  if (chainConfig !== undefined) {
    return None
  }

  return Some(chainConfig)
}

export function getChainsWithRpcs(): ChainConfig[] {
  return chains
}
