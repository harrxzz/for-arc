'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UnifiedBalanceCard } from '@/components/UnifiedBalanceCard'
import { CrossChainSpendCard } from '@/components/CrossChainSpendCard'
import { useTheme } from '@/components/ThemeProvider'
import { Globe, Zap } from 'lucide-react'

export default function UnifiedBalancePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const card = isDark ? 'glass-dark' : 'glass-light'

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-arc-violet/10 border border-arc-violet/20 rounded-full mb-4"
          >
            <Globe size={13} className="text-arc-violet" />
            <span className="text-sm text-arc-violet font-medium">Circle Gateway</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`text-3xl sm:text-4xl font-bold mb-3 ${heading}`}
          >
            Unified Balance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-sm ${muted}`}
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
            {/* Cross-chain Spend (the killer feature) */}
            <CrossChainSpendCard />

            {/* Supported chains */}
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${heading}`}>
                <Zap size={13} className="text-arc-violet" />
                Supported chains
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Arc Testnet', domain: 26, color: 'bg-arc-light' },
                  { name: 'Ethereum Sepolia', domain: 0, color: 'bg-slate-400' },
                  { name: 'Base Sepolia', domain: 6, color: 'bg-arc-light' },
                  { name: 'Arbitrum Sepolia', domain: 3, color: 'bg-arc-light' },
                ].map(({ name, domain, color }) => (
                  <div key={domain} className={`flex items-center justify-between px-3 py-2 rounded-xl ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className={`text-xs font-medium ${heading}`}>{name}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${muted}`}>domain {domain}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gateway info */}
            <div className={`rounded-2xl p-4 ${card}`}>
              <p className={`text-[11px] leading-relaxed ${muted}`}>
                Powered by{' '}
                <a
                  href="https://developers.circle.com/gateway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-arc-violet underline"
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
