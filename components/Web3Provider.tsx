'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider, createConfig } from 'wagmi'
import { http } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { arcTestnet } from '@/config/chains'

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#1d4ed8',
          logo: '/logo.png',
        },
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
