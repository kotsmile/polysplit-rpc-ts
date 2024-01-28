import { Err, Ok, Result } from 'ts-results'

import type { ProxyService } from '@/services/proxy'

import { safeWithError } from '@/utils'

export type EvmErrorType = 'timeout' | 'internal' | 'proxy'
export type EvmError = {
  type: EvmErrorType
  message: string
}

export class EvmService {
  constructor(
    private proxyService: ProxyService,
    public maxResponseTimeMs: number
  ) { }

  async rpcRequest(
    url: string,
    body: unknown,
    maxResponseTimeMs = this.maxResponseTimeMs
  ): Promise<Result<unknown, EvmError>> {
    const response = await safeWithError(
      this.proxyService.proxyPostRequest(url, body, maxResponseTimeMs)
    )

    if (response.err) {
      if (
        'status' in response.val &&
        (response.val.status === 502 || response.val.status === 504)
      ) {
        return Err({
          type: 'proxy',
          message: 'Proxy problem',
        })
      }
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
