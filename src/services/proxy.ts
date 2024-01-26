import { Err, None, Ok, Option, Result, Some } from 'ts-results'

import type { ProxySellerClient } from '@/internal/clients/proxy-seller'
import type { CacheRepo } from '@/internal/repo/cache'
import { logger } from '@/utils'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

export type ProxyConfig = {
  protocol: 'http'
  host: string
  port: number
  auth: {
    username: string
    password: string
  }
}

export class ProxyService {
  PROXY_KEY = 'proxies'
  proxyId = -1

  constructor(
    private cache: CacheRepo,
    private proxySellerClient: ProxySellerClient
  ) {}

  buildHttpAgent(proxy: ProxyConfig) {
    return new HttpsProxyAgent(
      `${proxy.protocol}.${proxy.auth.username}:${proxy.auth.password}@${proxy.host}:${proxy.port}`
    )
  }

  async proxyPostRequest(url: string, body: unknown, timeout?: number) {
    const proxy = (await this.nextProxy()).unwrapOr(None).unwrapOr(undefined)

    const response = await axios.post(url, body, {
      httpAgent: proxy ? this.buildHttpAgent(proxy) : undefined,
      timeout,
    })

    return response
  }

  async setProxies(proxies: ProxyConfig[]): Promise<Result<boolean, string>> {
    return (await this.cache.setValue(this.PROXY_KEY, proxies)).mapErr(
      (err) => `failed to set proxy: ${err}`
    )
  }

  async getProxies(): Promise<Result<Option<ProxyConfig[]>, string>> {
    return (await this.cache.getValue<ProxyConfig[]>(this.PROXY_KEY)).mapErr(
      (err) => `failed to get proxy: ${err}`
    )
  }

  async nextProxy(): Promise<Result<Option<ProxyConfig>, string>> {
    if (this.proxyId === -1) {
      await this.rotateProxy()
    }

    const proxies = await this.getProxies()
    if (proxies.err) {
      return Err(`failed to get proxies: ${proxies.val}`)
    }

    const proxy = proxies.val.unwrapOr([])[this.proxyId]
    if (proxy === undefined) {
      return Ok(None)
    }

    return Ok(Some(proxy))
  }

  async rotateProxy(): Promise<boolean> {
    logger.info('rotating proxy: ', this.proxyId)

    const proxies = await this.getProxies()
    if (proxies.err) {
      logger.error(`failed to get proxies: ${proxies.val}`)
      return false
    }

    const length = proxies.val.unwrapOr([]).length
    if (length === 0) {
      return false
    }
    this.proxyId = (this.proxyId + 1) % length

    const proxy = await this.nextProxy()
    if (proxy.err || proxy.val.none) {
      logger.error(`filed to get proxy: ${proxy.val}`)
      return await this.rotateProxy()
    }

    const response = await this.proxySellerClient.checkProxy(proxy.val.val)
    if (response.err) {
      logger.error(`failed to check proxy: ${response.val}`)
      return await this.rotateProxy()
    }

    if (!response.val) {
      logger.error(`failed to get good proxy: ${response.val}`)
      return await this.rotateProxy()
    }
    return true
  }

  async initProxies(): Promise<Result<void, string>> {
    const proxies = await this.proxySellerClient.fetchProxies(true)
    if (proxies.err) {
      return Err(`failed to fetch and check proxies: ${proxies.val}`)
    }

    const response = await this.setProxies(proxies.val)
    if (response.err) {
      return Err(`failed to save proxies: ${response.val}`)
    }

    return Ok(undefined)
  }
}
