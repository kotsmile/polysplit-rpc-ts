import { timePromise } from '@/utils'
import { run } from '@/utils/run'
import { JsonRpcProvider, ZeroAddress, formatEther } from 'ethers'

run('test chain id', async (chainId) => {
  if (chainId === undefined) {
    console.error('specify chainId')
    return
  }

  console.log('Checking', chainId)
  const rpc = 'http://localhost:3001/v1/chain/' + chainId
  const provider = new JsonRpcProvider(rpc)
  const blockNumber = await timePromise(provider.getBlockNumber())
  console.log(blockNumber)
  const block = await timePromise(provider.getBlock('latest'))
  console.log(block[0]?.hash, block[1])
  const balance = await timePromise(provider.getBalance(ZeroAddress))
  console.log(formatEther(balance[0]), balance[1])
})
