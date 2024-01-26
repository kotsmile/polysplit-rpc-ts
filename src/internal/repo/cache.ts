import { None, Ok, Option, Result, Some } from 'ts-results'
import NodeCache from 'node-cache'

export class CacheRepo {
  cache: NodeCache

  constructor() {
    this.cache = new NodeCache()
  }

  async setValue<T>(key: string, value: T): Promise<Result<boolean, string>> {
    return Ok(this.cache.set(key, value))
  }

  async getValue<T>(key: string): Promise<Result<Option<T>, string>> {
    const value = this.cache.get<T>(key)
    if (value === undefined) {
      return Ok(None)
    }

    return Ok(Some(value))
  }
}
