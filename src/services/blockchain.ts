import { Err, Ok, Result } from 'ts-results'
import axios, { AxiosHeaders } from 'axios'
import { env } from '@/env'
import { safe } from '@/utils'

export type BlockchainErrorType = 'timeout' | 'internal'
export type BlockchainError = {
  type: BlockchainErrorType
  message: string
}

const axiosTimeout = axios.create({ timeout: env.RESPONSE_TIMEOUT_MS })

export async function proxyRpcRequest(
  url: string,
  body: unknown,
  headers?: AxiosHeaders
): Promise<Result<unknown, BlockchainError>> {
  const response = await safe(
    axiosTimeout.post(url, body, {
      headers,
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
