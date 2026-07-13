'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UnifiedBalanceCard } from '@/components/UnifiedBalanceCard'
import { CrossChainSpendCard } from '@/components/CrossChainSpendCard'
import { Globe, Zap } from 'lucide-react'

export default function UnifiedBalancePage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[#09090b]">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge mb-5"
          >
            <Globe size={12} className="text-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium tracking-wide">Circle Gateway</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl sm:text-6xl text-white mb-4 leading-[1.05]"
            style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
          >
            Unified <span className="gradient-text">Balance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-white/40"
          >
            Deposit once, spend anywhere. Instant cross-chain USDC transfers in &lt;500ms.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <UnifiedBalanceCard />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <CrossChainSpendCard />

            <div className="nb-card rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Zap size={13} className="text-indigo-400" />
                Supported chains
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Arc Testnet', domain: 26, color: 'bg-indigo-400' },
                  { name: 'Ethereum Sepolia', domain: 0, color: 'bg-white/30' },
                  { name: 'Base Sepolia', domain: 6, color: 'bg-indigo-400' },
                  { name: 'Arbitrum Sepolia', domain: 3, color: 'bg-indigo-400' },
                ].map(({ name, domain, color }) => (
                  <div key={domain} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-xs font-medium text-white">{name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">domain {domain}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="nb-card rounded-2xl p-4">
              <p className="text-[11px] leading-relaxed text-white/40">
                Powered by{' '}
                <a
                  href="https://developers.circle.com/gateway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline"
                >
                  Circle Gateway
                </a>
                {' '}— permissionless, non-custodial crosschain USDC infrastructure.
                Gateway Wallet: <span className="font-mono text-[10px]">0x0077...A19B9</span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
