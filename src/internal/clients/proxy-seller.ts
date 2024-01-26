import axios, { AxiosInstance } from 'axios'
import { Err, Ok, Result } from 'ts-results'
import { z } from 'zod'

import { ProxyConfig } from '@/services/proxy'

import { logger, safe } from '@/utils'

export const ProxyElementSchema = z.object({
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
export const GetProxiesResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    items: z
      .record(z.string(), ProxyElementSchema)
      .or(z.array(ProxyElementSchema)),
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

type Order = {
  type: string
  orderId: string
}
export class ProxySellerClient {
  axiosClient: AxiosInstance

  constructor(
    proxySellerApiKey: string,
    private orders: Order[],
    private timeoutMs: number
  ) {
    this.axiosClient = axios.create({
      baseURL: `https://proxy-seller.com/personal/api/v1/${proxySellerApiKey}`,
    })
  }

  async checkProxy(proxy: ProxyConfig): Promise<Result<boolean, string>> {
    const proxyString = `${proxy.auth.username}:${proxy.auth.password}@${proxy.host}:${proxy.port}`
    // console.log(proxyString)
    const response = await safe(
      this.axiosClient.get('/tools/proxy/check', {
        params: {
          proxy: proxyString,
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

    return Ok(parsedResponse.data.data.time < this.timeoutMs)
  }

  async fetchProxies(
    withoutCheck = false
  ): Promise<Result<ProxyConfig[], string>> {
    const result: ProxyConfig[] = []
    for (const order of this.orders) {
      const response = await safe(
        this.axiosClient.get(`/proxy/list/${order.type}`, {
          params: {
            latest: 'y',
            orderId: order.orderId,
          },
        })
      )
      if (response.err) {
        logger.error(`failed to fetch proxy list: ${response.val}`)
        continue
      }

      const parsedResponse = GetProxiesResponseSchema.safeParse(
        response.val.data
      )
      if (!parsedResponse.success) {
        logger.error(`failed to parse response: ${parsedResponse.error}`)
        continue
      }

      result.push(
        ...Object.values(parsedResponse.data.data.items).map(
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
    console.log('proxy list length', result.length)
    if (withoutCheck) {
      return Ok(result)
    }

    const newResult: ProxyConfig[] = []
    for (const proxy of result) {
      const checkProxyResult = await this.checkProxy(proxy)
      if (checkProxyResult.err || !checkProxyResult.val) {
        continue
      }

      newResult.push(proxy)
    }

    return Ok(newResult)
  }
}
