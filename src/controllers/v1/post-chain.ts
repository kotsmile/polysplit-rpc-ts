import type { Request, Response } from 'express'

import { rpcService, evmService, statsService } from '@/impl'

import { endTimer, logger, startTimer } from '@/utils'
import { env } from '@/env'

export async function postChainControllerV1(req: Request, res: Response) {
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
    })
    return res.sendStatus(404)
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
    })
    return res.sendStatus(500)
  }

  if (rpcs.val.none) {
    logger.error(`no rpcs for chainId: ${chainId}`)
    const time = endTimer(start)
    await statsService.storeStats({
      chainId,
      status: 'error',
      responseTimeMs: time,
      errorMessage: `no rpcs for chainId: ${chainId}`,
    })
    return res.sendStatus(500)
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
  })
  return res.sendStatus(500)
}
