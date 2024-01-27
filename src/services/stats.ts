import { Result, Option } from 'ts-results'

import type { StorageRepo, Stats } from '@/internal/repo/storage'

export class StatsService {
  constructor(private storageDocRepo: StorageRepo) { }

  async insertStats(stats: Omit<Stats, 'date'>): Promise<Result<void, string>> {
    return await this.storageDocRepo.insertStats({
      ...stats,
      date: new Date().toUTCString(),
    })
  }

  async getPopularRpc(
    chainId: string
  ): Promise<Result<Option<string>, string>> {
    return await this.storageDocRepo.getPopularRpcStats(chainId)
  }

  async getUniqueUsers(chainId: string): Promise<Result<number, string>> {
    return await this.storageDocRepo.getUniqueUsersStats(chainId)
  }

  async getStatisctiOfResponseTimeMs(
    chainId: string
  ): Promise<Result<{ avg: number; max: number; min: number }, string>> {
    return await this.storageDocRepo.getStatisctiOfResponseTimeMsStats(chainId)
  }
}
