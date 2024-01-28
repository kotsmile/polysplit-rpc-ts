import { Result, Option, Ok } from 'ts-results'
import { z } from 'zod'

import type { StorageRepo } from '@/internal/repo/storage'
import { env } from '@/env'
import { Stats } from '@prisma/client'

export const StatsPerChainSchema = z.object({
  popularRpc: z.string(),
  uniqueUsers: z.number().int(),
  responseTimeMs: z.object({
    avg: z.number(),
    min: z.number(),
    max: z.number(),
  }),
  responseTimeMs24: z.object({
    avg: z.number(),
    min: z.number(),
    max: z.number(),
  }),
  topRpcs: z.array(z.string()),
  errorCount: z.number().int(),
  errorCount24: z.number().int(),
  okCount: z.number().int(),
  okCount24: z.number().int(),
  totalCount: z.number().int(),
  totalCount24: z.number().int(),
  avgAttempts: z.number(),
  avgAttempts24: z.number(),
})

type StatsPerChain = z.infer<typeof StatsPerChainSchema>

export const StatsSharedSchema = z.object({
  countFromLanding: z.number().int(),
  countFromLanding24: z.number().int(),
})

type StatsShared = z.infer<typeof StatsSharedSchema>

export class StatsService {
  constructor(private storageRepo: StorageRepo) {}

  async insertStats(
    stats: Omit<Stats, 'id' | 'created_at'>
  ): Promise<Result<void, string>> {
    if (env.ENV === 'development') {
      return Ok(undefined)
    }

    return await this.storageRepo.insertStats({
      ...stats,
      created_at: new Date(),
    })
  }

  async getPopularRpcForChainId(
    chainId: string
  ): Promise<Result<Option<string>, string>> {
    return (
      await this.storageRepo.getPopularRpcForChainIdStats(chainId)
    ).mapErr((err) => `failed to insert into stats collection: ${err}`)
  }

  async getStatisticOfUsageShared(): Promise<Result<StatsShared, string>> {
    const countFromLanding =
      await this.storageRepo.getTotalRecordsWithIsLandingStats()
    if (countFromLanding.err) {
      return countFromLanding
    }

    const countFromLanding24 =
      await this.storageRepo.getTotalRecordsWithIsLandingLast24HoursStats()
    if (countFromLanding24.err) {
      return countFromLanding24
    }

    return Ok({
      countFromLanding: countFromLanding.val,
      countFromLanding24: countFromLanding24.val,
    })
  }

  async getStatisticOfUsageForChainId(
    chainId: string
  ): Promise<Result<StatsPerChain, string>> {
    const popularRpc = await this.storageRepo.getPopularRpcForChainIdStats(
      chainId
    )
    if (popularRpc.err) {
      return popularRpc
    }

    const uniqueUsers = await this.storageRepo.getUniqueUsersForChainIdStats(
      chainId
    )
    if (uniqueUsers.err) {
      return uniqueUsers
    }

    const responseTimeMs =
      await this.storageRepo.getResponseTimeStatsForChainIdStats(chainId)
    if (responseTimeMs.err) {
      return responseTimeMs
    }

    const responseTimeMs24 =
      await this.storageRepo.getResponseTimeStatsLast24HoursForChainIdStats(
        chainId
      )
    if (responseTimeMs24.err) {
      return responseTimeMs24
    }

    const topRpcs = await this.storageRepo.getTopChoosenRpcForChainIdStats(
      chainId
    )
    if (topRpcs.err) {
      return topRpcs
    }

    const errorCount =
      await this.storageRepo.getErrorRecordsCountForChainIdStats(chainId)
    if (errorCount.err) {
      return errorCount
    }

    const errorCount24 =
      await this.storageRepo.getErrorRecordsCountLast24HoursForChainIdStats(
        chainId
      )
    if (errorCount24.err) {
      return errorCount24
    }

    const okCount = await this.storageRepo.getOkRecordsCountForChainIdStats(
      chainId
    )
    if (okCount.err) {
      return okCount
    }

    const okCount24 =
      await this.storageRepo.getOkRecordsCountLast24HoursForChainIdStats(
        chainId
      )
    if (okCount24.err) {
      return okCount24
    }

    const totalCount =
      await this.storageRepo.getTotalRecordsCountForChainIdStats(chainId)
    if (totalCount.err) {
      return totalCount
    }

    const totalCount24 =
      await this.storageRepo.getTotalRecordsCountLast24HoursForChainIdStats(
        chainId
      )
    if (totalCount24.err) {
      return totalCount24
    }

    const avgAttempts = await this.storageRepo.getAvgAttemptsForChainIdStats(
      chainId
    )
    if (avgAttempts.err) {
      return avgAttempts
    }

    const avgAttempts24 =
      await this.storageRepo.getAvgAttemptsLast24HoursForChainIdStats(chainId)
    if (avgAttempts24.err) {
      return avgAttempts24
    }

    return Ok({
      popularRpc: popularRpc.val.unwrapOr(''),
      uniqueUsers: uniqueUsers.val,
      responseTimeMs: responseTimeMs.val,
      responseTimeMs24: responseTimeMs24.val,
      topRpcs: topRpcs.val,
      errorCount: errorCount.val,
      errorCount24: errorCount24.val,
      okCount: okCount.val,
      okCount24: okCount24.val,
      totalCount: totalCount.val,
      totalCount24: totalCount24.val,
      avgAttempts: avgAttempts.val,
      avgAttempts24: avgAttempts24.val,
    })
  }
}
