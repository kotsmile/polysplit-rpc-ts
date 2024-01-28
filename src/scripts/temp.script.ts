import { run, safe, timePromise } from '@/utils'
import chains from '../services/chains.json'
import { JsonRpcProvider } from 'ethers'

run('temp', async () => {
  const ids = []
  for (const chain of chains) {
    ids.push(chain.chainId)
  }
  console.log(ids.join(','))

  const a = true
  while (a) {
    for (let chainId of ids) {
      chainId = '1'

      console.log('chainId', chainId)
      const rpc = 'https://rpc.polysplit.cloud/v1/chain/' + chainId
      // const rpc = 'http://localhost:3001/v1/chain/' + chainId
      const provider = new JsonRpcProvider(rpc)
      const res = await safe(timePromise(provider.getBlockNumber()))
      console.log(res.val[1])
    }
  }
})
