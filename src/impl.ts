import { env } from './env'

import { ProxySellerClient } from '@/internal/clients/proxy-seller'

import { CacheRepo } from '@/internal/repo/cache'
import { StorageDocRepo } from '@/internal/repo/storage-doc'

import { EvmService } from '@/services/evm'
import { ProxyService } from '@/services/proxy'
import { RpcService } from '@/services/rpc'
import { StatsService } from '@/services/stats'

const proxySellerClient = new ProxySellerClient(
  env.PROXYSELLER_API_KEY,
  '1953510',
  3000
)

const cacheRepo = new CacheRepo()
const storageDocRepo = new StorageDocRepo(env.MONGO_DB_URL)

export const evmService = new EvmService(env.RESPONSE_TIMEOUT_MS)
export const proxyService = new ProxyService(cacheRepo, proxySellerClient)
export const rpcService = new RpcService(cacheRepo)
export const statsService = new StatsService(
  storageDocRepo,
  env.MONGO_DB_NAME,
  env.MONGO_DB_STATS_COLLECTION
)
