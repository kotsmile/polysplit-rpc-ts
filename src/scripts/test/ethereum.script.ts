import { JsonRpcProvider, ZeroAddress, formatEther } from 'ethers'

import { run } from '@/utils'

run('Check connection to ethereum RPC', async () => {
  const rpc = 'http://localhost:3001/v1/chain/1'
  // const rpc = 'https://eth.llamarpc.com'
  const provider = new JsonRpcProvider(rpc)

  const blockNumber = await provider.getBlockNumber()
  console.log(blockNumber)

  const block = await provider.getBlock('latest')
  console.log(block?.hash)

  const balance = await provider.getBalance(ZeroAddress)
  console.log(formatEther(balance))
})
