import { Ok, Result } from 'ts-results'
import NodeCache from 'node-cache'
import { ProxyConfig } from '../proxy'

const cache = new NodeCache()

const PROXY_KEY = 'proxies'

export async function setRpcs(
  chainId: string,
  rpc: string[]
): Promise<Result<boolean, string>> {
  return Ok(cache.set(`chainId.${chainId}`, rpc))
}

export async function getRpcs(
  chainId: string
): Promise<Result<string[] | undefined, string>> {
  return Ok(cache.get(`chainId.${chainId}`))
}

export async function getProxies(): Promise<Result<ProxyConfig[], string>> {
  return Ok(cache.get(PROXY_KEY) ?? [])
}

export async function setProxies(
  proxies: ProxyConfig[]
): Promise<Result<boolean, string>> {
  return Ok(cache.set(PROXY_KEY, proxies))
}
