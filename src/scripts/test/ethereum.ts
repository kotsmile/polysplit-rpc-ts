import { JsonRpcProvider, ZeroAddress, formatEther } from 'ethers'

async function main(chainId: string) {
  console.log('Checking', chainId)
  const rpc = 'http://localhost:3001/v1/chain/' + chainId
  // const rpc = 'https://eth.llamarpc.com'
  // const rpc = 'https://rpc-mainnet.matic.network'
  const provider = new JsonRpcProvider(rpc)

  const blockNumber = await provider.getBlockNumber()
  console.log(blockNumber)

  const block = await provider.getBlock('latest')
  console.log(block?.hash)

  const balance = await provider.getBalance(ZeroAddress)
  console.log(formatEther(balance))
}

if (import.meta.main) {
  await main(Bun.argv[2] ?? '1')
}
