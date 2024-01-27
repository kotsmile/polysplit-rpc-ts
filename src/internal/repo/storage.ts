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
    return (await safe(this.getCollection(StatsCollection).insertOne(stats)))
      .mapErr((err) => `failed to insert into stats collection: ${err}`)
      .map(() => undefined)
  }

  async getPopularRpcStats(
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
      return Err(
        `failed to find popular rpc for chainId ${chainId}: ${response.val}`
      )
    }
    if (response.val === null) {
      return Ok(None)
    }

    return Ok(Some((response.val as unknown as { _id: string })._id))
  }

  async getUniqueUsersStats(chainId: string): Promise<Result<number, string>> {
    const response = await safe(
      this.getCollection(StatsCollection).distinct('ip', { chainId })
    )
    return response
      .map((v) => v.length)
      .mapErr(
        (err) => `failed to get unique users for chainId ${chainId}: ${err}`
      )
  }

  async getStatisctiOfResponseTimeMsStats(
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
      return Err(
        `failed to make request for avg/min/max response time ms for chainId ${chainId}: ${response.val}`
      )
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
}
