import type { Request, Response } from 'express'

import { rpcService, evmService, statsService, proxyService } from '@/impl'

import { endTimer, logger, startTimer } from '@/utils'
import { env } from '@/env'
import { StatsStatus } from '@prisma/client'

const WELCOME_MESSAGE =
  'If you have any questions or requests, just visit our website https://polysplit.cloud'

export async function postChainControllerV1(req: Request, res: Response) {
  const ip = req.header('x-forwarded-for') ?? req.socket.remoteAddress ?? null
  const isLanding = req.query.site !== undefined

  const start = startTimer()

  const chainId = req.params.chainId ?? '-'

  if (!env.SUPPORTED_CHAIN_IDS.includes(chainId)) {
    logger.error(`chainId: ${chainId} is not supported`)
    const time = endTimer(start)
    await statsService.insertStats({
      chainId,
      status: StatsStatus.ERROR,
      responseTimeMs: time,
      errorMessage: `chainId: ${chainId} is not supported`,
      ip,
      isLanding,
      attempts: -1,
      choosenRpc: '',
    })
    return res.status(404).send(WELCOME_MESSAGE)
  }

  const rpcs = await rpcService.getRpcs(chainId)
  if (rpcs.err) {
    logger.error(`faield to get rpcs for chainId: ${chainId}: ${rpcs.val}`)
    const time = endTimer(start)
    await statsService.insertStats({
      chainId,
      status: StatsStatus.ERROR,
      responseTimeMs: time,
      errorMessage: `faield to get rpcs for chainId: ${chainId}: ${rpcs.val}`,
      ip,
      isLanding,
      attempts: -1,
      choosenRpc: '',
    })
    return res.status(505).send(WELCOME_MESSAGE)
  }

  if (rpcs.val.none) {
    logger.error(`no rpcs for chainId: ${chainId}`)
    const time = endTimer(start)
    await statsService.insertStats({
      chainId,
      status: StatsStatus.ERROR,
      responseTimeMs: time,
      errorMessage: `no rpcs for chainId: ${chainId}`,
      ip,
      isLanding,
      attempts: -1,
      choosenRpc: '',
    })
    return res.status(500).send(WELCOME_MESSAGE)
  }

  for (let j = 1; j < 5; j++) {
    const responseTimeMs = evmService.maxResponseTimeMs * j
    let attempts = 0
    for (const url of rpcs) {
      attempts++
      const response = await evmService.rpcRequest(
        url,
        req.body,
        responseTimeMs
      )
      if (response.err) {
        if (response.val.type === 'proxy') {
          logger.warn('change proxy')
          await proxyService.rotateProxy()
        }
        logger.error(`failed to request RPC ${url}: ${response.val.message}`)
        continue
      }

      const time = endTimer(start)
      logger.info(`success: chainId ${chainId} with rpc: ${url} (${time}ms)`)
      await statsService.insertStats({
        chainId,
        status: StatsStatus.OK,
        responseTimeMs: time,
        ip,
        isLanding,
        attempts,
        errorMessage: '',
        choosenRpc: url,
      })
      return res.send(response.val)
    }
  }

  logger.error(`failed to request all RPCs for chainId: ${chainId}`)
  const time = endTimer(start)
  await statsService.insertStats({
    chainId,
    status: StatsStatus.ERROR,
    responseTimeMs: time,
    errorMessage: `failed to request all RPCs for chainId: ${chainId}`,
    ip,
    isLanding,
    attempts: -1,
    choosenRpc: '',
  })
  return res.status(500).send(WELCOME_MESSAGE)
}
