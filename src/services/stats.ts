import type { Result } from 'ts-results'

import type { StorageDocRepo } from '@/internal/repo/storage-doc'

import { now } from '@/utils'

export interface Stats {
  status: 'ok' | 'error'
  chainId: string
  responseTimeMs: number
  choosenRpc?: string
  errorMessage?: string
  date: number
}

export class StatsService {
  constructor(
    private storageDocRepo: StorageDocRepo,
    private dbName: string,
    private collectionName: string
  ) { }

  async storeStats(stats: Omit<Stats, 'date'>): Promise<Result<void, string>> {
    return (
      await this.storageDocRepo.insertOne<Stats>(
        this.dbName,
        this.collectionName,
        {
          ...stats,
          date: now(),
        }
      )
    ).mapErr((err) => `failed to insert stats record: ${err}`)
  }
}
