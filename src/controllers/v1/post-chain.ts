import type { Request, Response } from 'express'

import { rpcService, evmService, statsService } from '@/impl'

import { endTimer, logger, startTimer } from '@/utils'
import { env } from '@/env'

const WELCOME_MESSAGE =
  'If you have any questions or requests, just visit our website https://polysplit.cloud'

export async function postChainControllerV1(req: Request, res: Response) {
  const ip = req.header('x-forwarded-for') ?? req.socket.remoteAddress
  const isLanding = req.query.site !== undefined

  const start = startTimer()

  const chainId = req.params.chainId ?? '-'

  if (!env.SUPPORTED_CHAIN_IDS.includes(chainId)) {
    logger.error(`chainId: ${chainId} is not supported`)
    const time = endTimer(start)
    await statsService.storeStats({
      chainId,
      status: 'error',
      responseTimeMs: time,
      errorMessage: `chainId: ${chainId} is not supported`,
      ip,
      isLanding,
    })
    return res.status(404).send(WELCOME_MESSAGE)
  }

  const rpcs = await rpcService.getRpcs(chainId)
  if (rpcs.err) {
    logger.error(`faield to get rpcs for chainId: ${chainId}: ${rpcs.val}`)
    const time = endTimer(start)
    await statsService.storeStats({
      chainId,
      status: 'error',
      responseTimeMs: time,
      errorMessage: `faield to get rpcs for chainId: ${chainId}: ${rpcs.val}`,
      ip,
      isLanding,
    })
    return res.status(505).send(WELCOME_MESSAGE)
  }

  if (rpcs.val.none) {
    logger.error(`no rpcs for chainId: ${chainId}`)
    const time = endTimer(start)
    await statsService.storeStats({
      chainId,
      status: 'error',
      responseTimeMs: time,
      errorMessage: `no rpcs for chainId: ${chainId}`,
      ip,
      isLanding,
    })
    return res.status(500).send(WELCOME_MESSAGE)
  }

  for (const url of rpcs) {
    const response = await evmService.rpcRequest(url, req.body)
    if (response.err) {
      logger.error(`failed to request RPC ${url}: ${response.val.message}`)
      continue
    }

    logger.debug(`success: chainId ${chainId} with rpc: ${url}`)
    const time = endTimer(start)
    await statsService.storeStats({
      chainId,
      status: 'ok',
      choosenRpc: url,
      responseTimeMs: time,
      ip,
      isLanding,
    })
    return res.send(response.val)
  }

  logger.error(`failed to request all RPCs for chainId: ${chainId}`)
  const time = endTimer(start)
  await statsService.storeStats({
    chainId,
    status: 'error',
    responseTimeMs: time,
    errorMessage: `failed to request all RPCs for chainId: ${chainId}`,
    ip,
    isLanding,
  })
  return res.status(500).send(WELCOME_MESSAGE)
}
