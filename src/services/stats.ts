import { Err, None, Ok, Some, Result, Option } from 'ts-results'

import type { StorageDocRepo } from '@/internal/repo/storage-doc'

export interface Stats {
  status: 'ok' | 'error'
  chainId: string
  responseTimeMs: number
  choosenRpc?: string
  errorMessage?: string
  date: string
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
          date: new Date().toUTCString(),
        }
      )
    ).mapErr((err) => `failed to insert stats record: ${err}`)
  }

  async getPopularRpc(
    chainId: string
  ): Promise<Result<Option<string>, string>> {
    const response = await this.storageDocRepo.aggregateMany(
      this.dbName,
      this.collectionName,
      [
        { $match: { chainId } },
        { $group: { _id: '$choosenRpc', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]
    )
    console.log(response)
    if (response.err) {
      return Err(`failed to get most popular rpc: ${response.val}`)
    }

    const rpc = (response.val[0] as unknown as { _id: string })?._id
    if (rpc === undefined) {
      return Ok(None)
    }

    return Ok(Some(rpc))
  }
}
