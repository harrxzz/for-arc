import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

export const USDC_ADDRESS_ARC = '0x3600000000000000000000000000000000000000'
export const FEE_RECIPIENT = '0xfeacd1f962aec08f9f7d501659bd0dcc026f2775'
export const SWAP_FEE_BPS = 30 // 0.3%
export const BRIDGE_FEE_USDC = 0.5 // $0.5 flat

// Supported source chains for bridge
export const BRIDGE_SOURCE_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'ethereum',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    cctpDomain: 0,
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    icon: 'base',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    cctpDomain: 6,
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: 'arbitrum',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    cctpDomain: 3,
  },
]
