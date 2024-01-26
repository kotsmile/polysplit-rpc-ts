import { Err, Ok, Result } from 'ts-results'
import axios, { AxiosHeaders, AxiosInstance } from 'axios'

import type { ProxyConfig } from '@/services/proxy'

import { safeWithError } from '@/utils'

export type EvmErrorType = 'timeout' | 'internal'
export type EvmError = {
  type: EvmErrorType
  message: string
}

export class EvmService {
  axiosClient: AxiosInstance

  constructor(maxResponseTimeMs: number) {
    this.axiosClient = axios.create({ timeout: maxResponseTimeMs })
  }

  async proxyRpcRequest(
    url: string,
    body: unknown,
    headers?: AxiosHeaders,
    proxy?: ProxyConfig
  ): Promise<Result<unknown, EvmError>> {
    const response = await safeWithError(
      this.axiosClient.post(url, body, {
        headers,
        proxy,
      })
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
