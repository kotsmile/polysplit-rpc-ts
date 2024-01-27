import { env } from './env'

import { ProxySellerClient } from '@/internal/clients/proxy-seller'

import { CacheRepo } from '@/internal/repo/cache'
import { StorageRepo } from '@/internal/repo/storage'

import { EvmService } from '@/services/evm'
import { ProxyService } from '@/services/proxy'
import { RpcService } from '@/services/rpc'
import { StatsService } from '@/services/stats'
import { ChainlistClient } from './internal/clients/chainlist'

const proxySellerClient = new ProxySellerClient(
  env.PROXYSELLER_API_KEY,
  [
    { type: 'mix', orderId: '1953510' },
    // { type: 'mix', orderId: '1959084' },
  ],
  3000
)
const chainlistClient = new ChainlistClient()

const cacheRepo = new CacheRepo()
const storageRepo = new StorageRepo(env.MONGO_DB_URL)

export const proxyService = new ProxyService(cacheRepo, proxySellerClient)
export const evmService = new EvmService(proxyService, env.RESPONSE_TIMEOUT_MS)
export const rpcService = new RpcService(cacheRepo, chainlistClient)
export const statsService = new StatsService(storageRepo)
