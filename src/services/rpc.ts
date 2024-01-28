import { Option, Result, Err, Ok, None, Some } from 'ts-results'

import { CacheRepo } from '@/internal/repo/cache'
import chains from '@/services/chains.json'
import { ChainlistClient } from '@/internal/clients/chainlist'
import { logger } from '@/utils'

export type ChainConfig = {
  chainId: string
  rpcs: string[]
}

export class RpcService {
  RPC_KEY = 'chainId'

  constructor(
    private cacheRepo: CacheRepo,
    private chainlistClient: ChainlistClient
  ) {}

  getRpcKey(chainId: string): string {
    return `${this.RPC_KEY}.${chainId}`
  }

  async setRpcs(
    chainId: string,
    rpcs: string[]
  ): Promise<Result<boolean, string>> {
    return (
      await this.cacheRepo.setValue(this.getRpcKey(chainId), rpcs)
    ).mapErr((err) => `failed to set rpcs: ${err}`)
  }

  async getRpcs(chainId: string): Promise<Result<Option<string[]>, string>> {
    return (
      await this.cacheRepo.getValue<string[]>(this.getRpcKey(chainId))
    ).mapErr((err) => `failed to get rpcs: ${err}`)
  }

  getChainConfig(chainId: string): Option<ChainConfig> {
    const chainConfig = chains.filter((c) => c.chainId === chainId)[0]
    if (chainConfig === undefined) {
      return None
    }

    return Some(chainConfig)
  }

  async fetchAllRpcs(): Promise<Result<Record<string, string[]>, string>> {
    return (await this.chainlistClient.fetchRpcs()).mapErr(
      (err) => `failed to fetch all rpcs: ${err}`
    )
  }

  async fetchChainRpcs(chainId: string): Promise<Result<string[], string>> {
    const allRpcs = await this.chainlistClient.fetchRpcs()
    if (allRpcs.err) {
      logger.warn(`failed to fetch rpcs: ${allRpcs.val}`)
      const backup = this.getChainConfig(chainId)
      if (backup.some) {
        return Ok(backup.val.rpcs)
      } else {
        return Err(
          `failed to fetch rpcs and use backup for chainId: ${chainId}`
        )
      }
    }

    const rpcs = allRpcs.val[chainId]
    if (rpcs === undefined) {
      logger.warn(`no rpcs for chainId: ${chainId}`)
      const backup = this.getChainConfig(chainId)
      if (backup.some) {
        return Ok(backup.val.rpcs)
      } else {
        return Err(`no rpcs for chainId: ${chainId}`)
      }
    }

    return Ok(rpcs)
  }
}
