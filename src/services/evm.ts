import { Err, Ok, Result } from 'ts-results'

import type { ProxyService } from '@/services/proxy'

import { safeWithError } from '@/utils'

export type EvmErrorType = 'timeout' | 'internal'
export type EvmError = {
  type: EvmErrorType
  message: string
}

export class EvmService {
  constructor(
    private proxyService: ProxyService,
    private maxResponseTimeMs: number
  ) { }

  async rpcRequest(
    url: string,
    body: unknown
  ): Promise<Result<unknown, EvmError>> {
    const response = await safeWithError(
      this.proxyService.proxyPostRequest(url, body, this.maxResponseTimeMs)
    )

    if (response.err) {
      if ('code' in response.val && response.val.code === 'ECONNABORTED') {
        return Err({
          type: 'timeout',
          message: 'Request is timeout',
        })
      }

      return Err({
        type: 'internal',
        message: response.val.message,
      })
    }

    return Ok(response.val.data)
  }
}
