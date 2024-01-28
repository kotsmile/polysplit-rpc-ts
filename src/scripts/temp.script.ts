import { run, timePromise } from '@/utils'
import chains from '../services/chains.json'
import { JsonRpcProvider } from 'ethers'

run('temp', async () => {
  const ids = []
  for (const chain of chains) {
    ids.push(chain.chainId)
  }
  console.log(ids.join(','))

  while (true) {
    for (const chainId of ids) {
      console.log('chainId', chainId)
      const rpc = 'http://localhost:3001/v1/chain/' + chainId
      const provider = new JsonRpcProvider(rpc)
      const [, ms] = await timePromise(provider.getBlockNumber())
      console.log(ms)
    }
  }
})
