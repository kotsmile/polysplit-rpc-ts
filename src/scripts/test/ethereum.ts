import { timePromise } from '@/utils'
import { JsonRpcProvider, ZeroAddress, formatEther } from 'ethers'

async function main(chainId: string) {
  // while (true) {
  console.log('Checking', chainId)
  const rpc = 'http://localhost:3001/v1/chain/' + chainId
  // const rpc = 'https://eth.llamarpc.com'
  // const rpc = 'https://rpc-mainnet.matic.network'
  const provider = new JsonRpcProvider(rpc)

  const blockNumber = await timePromise(provider.getBlockNumber())
  console.log(blockNumber)

  const block = await timePromise(provider.getBlock('latest'))
  console.log(block[0]?.hash, block[1])

  const balance = await timePromise(provider.getBalance(ZeroAddress))
  console.log(formatEther(balance[0]), balance[1])
  // }
}

if (import.meta.main) {
  await main(Bun.argv[2] ?? '1')
}
