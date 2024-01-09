import { Ok, Result } from 'ts-results'
import NodeCache from 'node-cache'

const cache = new NodeCache()

export async function setRpcs(
  chainId: string,
  rpc: string[]
): Promise<Result<boolean, string>> {
  return Ok(cache.set(chainId, rpc))
}

export async function getRpcs(
  chainId: string
): Promise<Result<string[] | undefined, string>> {
  return Ok(cache.get(chainId))
}
