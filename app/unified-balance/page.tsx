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
    <div className={`min-h-screen relative grain-overlay ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4 overflow-hidden">
        <div className="mesh-gradient" aria-hidden="true" />
        <div className="max-w-3xl mx-auto text-center mb-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 badge-live glow-violet"
          >
            <Globe size={13} className="text-arc-violet" />
            <span className="text-xs text-arc-violet font-semibold uppercase tracking-wide">Circle Gateway</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`text-4xl sm:text-6xl font-black mb-4 leading-tight tracking-tight ${heading}`}
            style={{ letterSpacing: '-0.035em' }}
          >
            Unified <span className="gradient-text">Balance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-sm sm:text-base ${muted}`}
          >
            Deposit once, spend anywhere. Instant cross-chain USDC transfers in &lt;500ms.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start relative z-10">
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
            <div className="rounded-2xl p-5 glass-violet hover-glow">
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${heading}`}>
                <Zap size={13} className="text-arc-violet" />
                Supported chains
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Arc Testnet', domain: 26, color: 'bg-arc-violet' },
                  { name: 'Ethereum Sepolia', domain: 0, color: 'bg-slate-400' },
                  { name: 'Base Sepolia', domain: 6, color: 'bg-arc-violet' },
                  { name: 'Arbitrum Sepolia', domain: 3, color: 'bg-arc-violet' },
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
            <div className={`rounded-2xl p-4 hover-glow ${card}`}>
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
