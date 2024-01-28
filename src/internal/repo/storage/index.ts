import { Err, None, Ok, Option, Result, Some } from 'ts-results'
import { PrismaClient, Stats, StatsStatus } from '@prisma/client'

import { safe } from '@/utils'

type StorageSession = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]

export class StorageRepo {
  client: PrismaClient

  constructor(psqlDbConnectionUrl: string) {
    this.client = new PrismaClient({ datasourceUrl: psqlDbConnectionUrl })
  }

  async connect(): Promise<Result<void, string>> {
    const response = await safe(this.client.$connect())
    if (response.err) {
      return Err(`failed to connect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async disconnect(): Promise<Result<void, string>> {
    const response = await safe(this.client.$disconnect())
    if (response.err) {
      return Err(`failed to disconnect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async withTx<T>(
    callback: (session: StorageSession) => Promise<Result<T, string>>,
    opts?: { maxWait: number; timeout?: number }
  ): Promise<Result<T, string>> {
    const result = await safe(
      this.client.$transaction(async (tx) => await callback(tx), opts)
    )
    if (result.err) {
      return Err(`failed to execute transaction: ${result.val}`)
    }
    return result.val
  }

  async insertStats(stats: Omit<Stats, 'id'>): Promise<Result<void, string>> {
    return (await safe(this.client.stats.create({ data: stats }))).map(
      () => undefined
    )
  }

  async getTotalRecordsWithIsLandingStats(
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: { isLanding: true },
      })
    )
  }

  getDate24HoursAgo() {
    return new Date(Date.now() - 24 * 60 * 60 * 1000)
  }

  async getTotalRecordsWithIsLandingLast24HoursStats(
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: {
          isLanding: true,
          created_at: {
            gte: this.getDate24HoursAgo(),
          },
        },
      })
    )
  }

  async getPopularRpcForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<Option<string>, string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.groupBy({
        by: ['choosenRpc'],
        where: { chainId, status: StatsStatus.OK },
        _count: {
          choosenRpc: true,
        },
        orderBy: {
          _count: {
            choosenRpc: 'desc',
          },
        },
        take: 1,
      })
    )
    if (response.err) {
      return response
    }

    const firstElement = response.val[0]
    if (firstElement === undefined) {
      return Ok(None)
    }

    return Ok(Some(firstElement.choosenRpc))
  }

  async getUniqueUsersForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats
        .findMany({
          where: { chainId },
          distinct: ['ip'],
          select: { ip: true },
        })
        .then((v) => v.length)
    )
    return response
  }

  async getResponseTimeStatsForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<{ avg: number; max: number; min: number }, string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.aggregate({
        where: { chainId, status: StatsStatus.OK, responseTimeMs: { not: 0 } },
        _avg: {
          responseTimeMs: true,
        },
        _max: {
          responseTimeMs: true,
        },
        _min: {
          responseTimeMs: true,
        },
      })
    )
    if (response.err) {
      return response
    }

    const { _avg, _min, _max } = response.val
    return Ok({
      avg: _avg.responseTimeMs ?? -1,
      min: _min.responseTimeMs ?? -1,
      max: _max.responseTimeMs ?? -1,
    })
  }

  async getResponseTimeStatsLast24HoursForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<
    Result<
      {
        min: number
        max: number
        avg: number
      },
      string
    >
  > {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.aggregate({
        where: {
          chainId,
          status: StatsStatus.OK,
          responseTimeMs: { not: 0 },
          created_at: {
            gte: this.getDate24HoursAgo(),
          },
        },
        _avg: {
          responseTimeMs: true,
        },
        _max: {
          responseTimeMs: true,
        },
        _min: {
          responseTimeMs: true,
        },
      })
    )
    if (response.err) {
      return response
    }

    const { _avg, _min, _max } = response.val
    return Ok({
      avg: _avg.responseTimeMs ?? -1,
      min: _min.responseTimeMs ?? -1,
      max: _max.responseTimeMs ?? -1,
    })
  }

  async getTopChoosenRpcForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<string[], string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.groupBy({
        by: ['choosenRpc'],
        where: { chainId, status: StatsStatus.OK },
        _count: {
          choosenRpc: true,
        },
        orderBy: {
          _count: {
            choosenRpc: 'desc',
          },
        },
        take: 10,
      })
    )
    return response.map((v) => v.map((v) => v.choosenRpc))
  }

  async getErrorRecordsCountForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: { chainId, status: StatsStatus.ERROR },
      })
    )
  }

  async getErrorRecordsCountLast24HoursForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: {
          chainId,
          status: StatsStatus.ERROR,
          created_at: { gte: this.getDate24HoursAgo() },
        },
      })
    )
  }

  async getOkRecordsCountForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: { chainId, status: StatsStatus.OK },
      })
    )
  }

  async getOkRecordsCountLast24HoursForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: {
          chainId,
          status: StatsStatus.OK,
          created_at: { gte: this.getDate24HoursAgo() },
        },
      })
    )
  }

  async getTotalRecordsCountForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: { chainId },
      })
    )
  }

  async getTotalRecordsCountLast24HoursForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    return await safe(
      executer.stats.count({
        where: {
          chainId,
          created_at: { gte: this.getDate24HoursAgo() },
        },
      })
    )
  }

  async getAvgAttemptsLast24HoursForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.aggregate({
        where: {
          chainId,
          status: StatsStatus.OK,
          created_at: { gte: this.getDate24HoursAgo() },
          attempts: { not: -1 },
        },
        _avg: {
          attempts: true,
        },
      })
    )
    return response.map((v) => v._avg.attempts ?? -1)
  }

  async getAvgAttemptsForChainIdStats(
    chainId: string,
    session?: StorageSession
  ): Promise<Result<number, string>> {
    const executer = session ?? this.client
    const response = await safe(
      executer.stats.aggregate({
        where: {
          chainId,
          status: StatsStatus.OK,
          attempts: { not: -1 },
        },
        _avg: {
          attempts: true,
        },
      })
    )
    return response.map((v) => v._avg.attempts ?? -1)
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
