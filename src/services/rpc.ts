import { None, Some, Option, Result } from 'ts-results'

import { CacheRepo } from '@/internal/repo/cache'
import chains from '@/services/chains.json'

export type ChainConfig = {
  chainId: string
  name: string
  rpcs: string[]
}

export class RpcService {
  RPC_KEY = 'chainId'

  constructor(private cache: CacheRepo) { }

  getRpcKey(chainId: string): string {
    return `${this.RPC_KEY}.${chainId}`
  }

  async setRpcs(
    chainId: string,
    rpcs: string[]
  ): Promise<Result<boolean, string>> {
    return (await this.cache.setValue(this.getRpcKey(chainId), rpcs)).mapErr(
      (err) => `failed to set rpcs: ${err}`
    )
  }

  async getRpcs(chainId: string): Promise<Result<Option<string[]>, string>> {
    return (
      await this.cache.getValue<string[]>(this.getRpcKey(chainId))
    ).mapErr((err) => `failed to get rpcs: ${err}`)
  }

  getChainConfig(chainId: string): Option<ChainConfig> {
    const chainConfig = chains.filter((c) => c.chainId === chainId)[0]
    if (chainConfig === undefined) {
      return None
    }

    return Some(chainConfig)
  }
}
