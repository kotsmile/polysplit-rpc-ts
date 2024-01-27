import { Result, Option, Ok } from 'ts-results'

import type { StorageRepo, Stats } from '@/internal/repo/storage'
import { env } from '@/env'
import { z } from 'zod'

export const StatsPerChainSchema = z.object({
  popularRpc: z.string(),
  uniqueUsers: z.number(),
  responseTimeMs: z.object({
    avg: z.number(),
    min: z.number(),
    max: z.number(),
  }),
  topRpcs: z.array(z.string()),
  errorCount: z.number(),
  errorCount24: z.number(),
  okCount: z.number(),
  okCount24: z.number(),
  totalCount: z.number(),
  totalCount24: z.number(),
  avgAttempts: z.number(),
  avgAttempts24: z.number(),
})

type StatsPerChain = z.infer<typeof StatsPerChainSchema>

export const StatsSharedSchema = z.object({
  countFromLanding: z.number(),
  countFromLanding24: z.number(),
})

type StatsShared = z.infer<typeof StatsSharedSchema>

export class StatsService {
  constructor(private storageRepo: StorageRepo) { }

  async insertStats(stats: Omit<Stats, 'date'>): Promise<Result<void, string>> {
    return await this.storageRepo.insertStats({
      ...stats,
      date: new Date().toUTCString(),
    })
  }

  async getPopularRpcForChainId(
    chainId: string
  ): Promise<Result<Option<string>, string>> {
    return (
      await this.storageRepo.getPopularRpcForChainIdStats(chainId)
    ).mapErr((err) => `failed to insert into stats collection: ${err}`)
  }

  async getStatisticOfUsage(): Promise<
    Result<
      { shared: StatsShared; perChainId: Record<string, StatsPerChain> },
      string
    >
  > {
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

    const perChainId: Record<string, StatsPerChain> = {}
    for (const chainId of env.SUPPORTED_CHAIN_IDS) {
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

      perChainId[chainId] = {
        popularRpc: popularRpc.val.unwrapOr(''),
        uniqueUsers: uniqueUsers.val,
        responseTimeMs: responseTimeMs.val,
        topRpcs: topRpcs.val,
        errorCount: errorCount.val,
        errorCount24: errorCount24.val,
        okCount: okCount.val,
        okCount24: okCount24.val,
        totalCount: totalCount.val,
        totalCount24: totalCount24.val,
        avgAttempts: avgAttempts.val,
        avgAttempts24: avgAttempts24.val,
      }
    }

    return Ok({
      shared: {
        countFromLanding: countFromLanding.val,
        countFromLanding24: countFromLanding24.val,
      },
      perChainId,
    })
  }
}
