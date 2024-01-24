import { env } from '@/env'
import { safe } from '@/utils'
import axios from 'axios'
import { Err, Ok, Result } from 'ts-results'
import { z } from 'zod'

export type ProxyConfig = {
  protocol: 'http'
  host: string
  port: number
  auth: {
    username: string
    password: string
  }
}

const proxySellerClient = axios.create({
  baseURL: `https://proxy-seller.com/personal/api/v1/${env.PROXYSELLER_API_KEY}`,
})

export const GetProxiesResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        order_id: z.string(),
        ip: z.string(),
        protocol: z.enum(['HTTP']),
        port_http: z.number(),
        port_socks: z.number(),
        login: z.string(),
        password: z.string(),
        auth_ip: z.string(),
        country: z.string(),
        status: z.enum(['Active']),
      })
    ),
  }),
})

export const CheckProxyResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    // "ip": "127.0.0.1",
    // "port": 8080,
    // "user": "auth_user",
    // "password": "auth_password",
    // "valid": true,
    // "protocol": "HTTP",
    // "time": 1234
    valid: z.boolean(),
    time: z.number(),
  }),
})

export async function checkProxy(
  proxy: ProxyConfig
): Promise<Result<number, string>> {
  const response = await safe(
    proxySellerClient.get('/tools/proxy/check', {
      params: {
        proxy: `${proxy.auth.username}:${proxy.auth.password}@${proxy.host}:${proxy.port}`,
      },
    })
  )
  if (response.err) {
    return Err(`failed to check proxy: ${response.val}`)
  }

  const parsedResponse = CheckProxyResponseSchema.safeParse(response.val.data)
  if (!parsedResponse.success) {
    return Err(
      `failed to parse check proxy response: ${parsedResponse.error.toString()}`
    )
  }

  if (
    parsedResponse.data.status !== 'success' ||
    !parsedResponse.data.data.valid
  ) {
    return Err(`bad proxy`)
  }

  return Ok(parsedResponse.data.data.time)
}

export async function fetchProxies(
  withoutCheck = false
): Promise<Result<ProxyConfig[], string>> {
  const response = await safe(
    proxySellerClient.get('/proxy/list/mix', {
      params: {
        latest: 'y',
        orderId: '1953510',
      },
    })
  )
  if (response.err) {
    return Err(`failed to fetch proxy list: ${response.val}`)
  }

  const parsedResponse = GetProxiesResponseSchema.safeParse(response.val.data)
  if (!parsedResponse.success) {
    return Err(`failed to parse response: ${parsedResponse.error}`)
  }

  const result = parsedResponse.data.data.items.map(
    (d): ProxyConfig => ({
      protocol: 'http',
      host: d.ip,
      port: d.port_http,
      auth: {
        username: d.login,
        password: d.password,
      },
    })
  )
  if (withoutCheck) {
    return Ok(result)
  }

  const newResult: ProxyConfig[] = []
  for (const proxy of result) {
    const checkProxyResult = await checkProxy(proxy)
    if (
      checkProxyResult.err ||
      checkProxyResult.val > env.RESPONSE_TIMEOUT_MS
    ) {
      continue
    }

    newResult.push(proxy)
  }

  return Ok(newResult)
}
