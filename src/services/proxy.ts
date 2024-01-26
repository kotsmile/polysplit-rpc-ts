import { Err, Ok, Option, Result } from 'ts-results'

import type { ProxySellerClient } from '@/internal/clients/proxy-seller'
import type { CacheRepo } from '@/internal/repo/cache'

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

  constructor(
    private cache: CacheRepo,
    private proxySellerClient: ProxySellerClient
  ) {}

  async setProxies(proxies: ProxyConfig[]): Promise<Result<boolean, string>> {
    return await this.cache.setValue(this.PROXY_KEY, proxies)
  }

  async getProxies(): Promise<Result<Option<ProxyConfig[]>, string>> {
    return await this.cache.getValue<ProxyConfig[]>(this.PROXY_KEY)
  }

  async initProxies(): Promise<Result<void, string>> {
    const proxies = await this.proxySellerClient.fetchProxies()
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
