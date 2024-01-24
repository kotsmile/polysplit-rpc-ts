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
  status: z.literal('success'),
  data: z.object({
    items: z.array(
      z.object({
        id: z.number(),
        order_id: z.number(),
        ip: z.string(),
        protocol: z.enum(['HTTP']),
        port_http: z.number(),
        port_socks: z.number(),
        login: z.string(),
        password: z.string(),
        auth_ip: z.string(),
        country: z.string(),
        status: z.enum(['ACTIVE']),
        rotation: z.string(),
        link_reboot: z.string(),
      })
    ),
  }),
})

export async function getProxies(): Promise<Result<ProxyConfig[], string>> {
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

  return Ok(
    parsedResponse.data.data.items.map(
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
  )
}
