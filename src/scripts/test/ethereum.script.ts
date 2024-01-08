import { JsonRpcProvider } from 'ethers'
import { run } from '@/utils'

run('Check connection to ethereum RPC', async () => {
  const rpc = 'http://localhost:3001/v1/chain/1'
  // const rpc = 'https://eth.llamarpc.com'
  const providers = new JsonRpcProvider(rpc)

  const blockNumber = await providers.getBlockNumber()
  console.log(blockNumber)

  const block = await providers.getBlock('latest')
  console.log(block)
})
