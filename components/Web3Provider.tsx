'use client'

import { useEffect, useState } from 'react'
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
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim()

function MissingPrivyConfig() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80 mb-3">For Arc setup</p>
        <h1 className="font-display text-3xl font-semibold mb-3">Privy app ID belum diset</h1>
        <p className="text-white/60 leading-relaxed mb-6">
          Tambahkan <code className="rounded bg-white/10 px-1.5 py-0.5 text-indigo-200">NEXT_PUBLIC_PRIVY_APP_ID</code> di
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-indigo-200"> .env.local</code> atau Vercel Environment Variables,
          lalu rebuild. Fallback ini mencegah build gagal saat env belum tersedia.
        </p>
        <div className="rounded-2xl bg-black/40 border border-white/10 p-4 text-left font-mono text-xs text-white/70">
          NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
        </div>
      </div>
    </main>
  )
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!privyAppId) {
    return <MissingPrivyConfig />
  }

  return (
    <PrivyProvider
      appId={privyAppId}
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
