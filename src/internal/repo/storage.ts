import { Collection, Document, MongoClient } from 'mongodb'
import { Err, None, Ok, Option, Result, Some } from 'ts-results'

import { safe } from '@/utils'

type CollectionMetadata<T extends Document> = {
  db: string
  collection: string
  _type: T
}

export interface Stats {
  status: 'ok' | 'error'
  chainId: string
  responseTimeMs: number
  choosenRpc?: string
  errorMessage?: string
  date: string
  ip?: string
  isLanding?: boolean
  attempts?: number
}

export const StatsCollection: CollectionMetadata<Stats> = {
  db: 'main',
  collection: 'stats',
  _type: {} as Stats,
}

export class StorageRepo {
  client: MongoClient

  constructor(mongoDbConnectionUrl: string) {
    this.client = new MongoClient(mongoDbConnectionUrl)
  }

  async connect(): Promise<Result<void, string>> {
    const response = await safe(this.client.connect())
    if (response.err) {
      return Err(`failed to connect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async disconnect(): Promise<Result<void, string>> {
    const response = await safe(this.client.close())
    if (response.err) {
      return Err(`failed to disconnect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  getCollection<T extends Document>({
    db,
    collection,
  }: CollectionMetadata<T>): Collection<T> {
    return this.client.db(db).collection<T>(collection)
  }

  async insertStats(stats: Stats): Promise<Result<void, string>> {
    return (
      await safe(this.getCollection(StatsCollection).insertOne(stats))
    ).map(() => undefined)
  }

  async getTotalRecordsWithIsLandingStats(): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        isLanding: true,
      })
    )
  }

  async getTotalRecordsWithIsLandingLast24HoursStats(): Promise<
    Result<number, string>
  > {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        isLanding: true,
        date: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString(),
        },
      })
    )
  }

  async getPopularRpcForChainIdStats(
    chainId: string
  ): Promise<Result<Option<string>, string>> {
    const response = await safe(
      this.getCollection(StatsCollection)
        .aggregate([
          { $match: { chainId } },
          { $group: { _id: '$choosenRpc', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ])
        .tryNext()
    )
    if (response.err) {
      return response
    }
    if (response.val === null) {
      return Ok(None)
    }

    return Ok(Some((response.val as unknown as { _id: string })._id))
  }

  async getUniqueUsersForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    const response = await safe(
      this.getCollection(StatsCollection).distinct('ip', { chainId })
    )
    return response
      .map((v) => v.length)
      .mapErr(
        (err) => `failed to get unique users for chainId ${chainId}: ${err}`
      )
  }

  async getResponseTimeStatsForChainIdStats(
    chainId: string
  ): Promise<Result<{ avg: number; max: number; min: number }, string>> {
    const response = await safe(
      this.getCollection(StatsCollection)
        .aggregate([
          {
            $match: { chainId },
          },
          {
            $group: {
              _id: '$chainId',
              min: { $min: '$responseTimeMs' },
              max: { $max: '$responseTimeMs' },
              avg: { $avg: '$responseTimeMs' },
            },
          },
        ])
        .toArray()
    )
    if (response.err) {
      return response
    }
    if (response.val.length === 0) {
      return Err(`failed to find chainId ${chainId}`)
    }

    const s = response.val[0]
    if (s === undefined) {
      return Err(`no stats ${response.val}`)
    }

    return Ok({ avg: s.avg, min: s.min, max: s.max })
  }

  async getResponseTimeStatsLast24HoursForChainIdStats(
    chainId: string
  ): Promise<
    Result<
      {
        minResponseTimeMs: number
        maxResponseTimeMs: number
        avgResponseTimeMs: number
      },
      string
    >
  > {
    return (
      await safe(
        this.getCollection(StatsCollection)
          .aggregate([
            {
              $match: {
                chainId,
                status: 'ok',
                date: {
                  $gte: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                  ).toUTCString(),
                },
              },
            },
            {
              $group: {
                _id: null,
                minResponseTimeMs: { $min: '$responseTimeMs' },
                maxResponseTimeMs: { $max: '$responseTimeMs' },
                avgResponseTimeMs: { $avg: '$responseTimeMs' },
              },
            },
          ])
          .toArray()
      )
    ).map(
      (v) =>
        v[0] as {
          minResponseTimeMs: number
          maxResponseTimeMs: number
          avgResponseTimeMs: number
        }
    )
  }

  async getTopChoosenRpcForChainIdStats(
    chainId: string
  ): Promise<Result<string[], string>> {
    return (
      await safe(
        this.getCollection(StatsCollection)
          .aggregate([
            { $match: { chainId } },
            { $group: { _id: '$choosenRpc', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ])
          .toArray()
      )
    ).map((v) => v.map((el) => el._id as string))
  }

  async getErrorRecordsCountForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId,
        status: 'error',
      })
    )
  }

  async getErrorRecordsCountLast24HoursForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId,
        status: 'error',
        date: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString(),
        },
      })
    )
  }

  async getOkRecordsCountForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId: chainId,
        status: 'ok',
      })
    )
  }

  async getOkRecordsCountLast24HoursForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId,
        status: 'ok',
        date: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString(),
        },
      })
    )
  }

  async getTotalRecordsCountForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId: chainId,
      })
    )
  }

  async getTotalRecordsCountLast24HoursForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return await safe(
      this.getCollection(StatsCollection).countDocuments({
        chainId,
        date: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString(),
        },
      })
    )
  }

  async getAvgAttemptsLast24HoursForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return (
      await safe(
        this.getCollection(StatsCollection)
          .aggregate([
            {
              $match: {
                chainId,
                status: 'ok',
                date: {
                  $gte: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                  ).toUTCString(),
                },
              },
            },
            {
              $group: {
                _id: null,
                avgAttempts: { $avg: '$attempts' },
              },
            },
          ])
          .toArray()
      )
    ).map((v) => v[0]?.avgAttempts as number)
  }

  async getAvgAttemptsForChainIdStats(
    chainId: string
  ): Promise<Result<number, string>> {
    return (
      await safe(
        this.getCollection(StatsCollection)
          .aggregate([
            {
              $match: {
                chainId,
                status: 'ok',
              },
            },
            {
              $group: {
                _id: null,
                avgAttempts: { $avg: '$attempts' },
              },
            },
          ])
          .toArray()
      )
    ).map((v) => v[0]?.avgAttempts as number)
  }
}

// help me with mongo db request
// i have collection "stats" in db "main" with schema:
// ```ts
// export interface Stats {
//   status: 'ok' | 'error'
//   chainId: string
//   responseTimeMs: number
//   choosenRpc?: string
//   errorMessage?: string
//   date: string
//   ip?: string
//   isLanding?: boolean
//   attempts?: number
// }
// ```
// can you generate functions for this requests
//  - top 10 choosenRpc for specific chainId
//  - amount of records with status == "error" for specific chainId
//  - amount of records with status == "ok" for specific chainId
//  - total amount of records for specific chainId
//  - amount of records with status == "error" for last 24 hours for specific chainId
//  - amount of records with status == "ok" for last 24 hours for specific chainId
//  - total amount of records for last 24 hours for specific chainId
//  - total amount of records with isLanding == true
//  - total amount of records with isLanding == true for last 24 hours
//  - min / max / avg responseTimeMs with status == "ok" for last 24 hours for specific chainId
//  - avg attempts with status == "ok" for last 24 hours for specific chainId
//  - avg attempts with status == "ok"  for specific chainId
