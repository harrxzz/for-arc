'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UnifiedBalanceCard } from '@/components/UnifiedBalanceCard'
import { useTheme } from '@/components/ThemeProvider'
import { Globe, Zap, ArrowLeftRight } from 'lucide-react'

export default function UnifiedBalancePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const card = isDark ? 'glass-dark' : 'glass-light'

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#020208]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4"
          >
            <Globe size={13} className="text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">Circle Gateway</span>
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
            Deposit USDC from any chain into Circle Gateway — one balance, instant crosschain transfers.
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
            {/* How it works */}
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-4 ${heading}`}>How Gateway works</h3>
              <div className="space-y-4">
                {[
                  {
                    Icon: ArrowLeftRight,
                    step: '01',
                    title: 'Deposit from any chain',
                    desc: 'Deposit USDC from Ethereum, Base, Arbitrum, or Arc into your Gateway balance.',
                  },
                  {
                    Icon: Globe,
                    step: '02',
                    title: 'One unified balance',
                    desc: 'All deposits aggregate into a single balance visible across all chains.',
                  },
                  {
                    Icon: Zap,
                    step: '03',
                    title: 'Instant transfers (<500ms)',
                    desc: 'Transfer USDC to any supported chain instantly — no waiting for finality.',
                  },
                ].map(({ Icon, step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/15' : 'bg-purple-50'}`}>
                      <Icon size={15} className="text-purple-400" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-purple-400">{step}</span>
                        <span className={`text-xs font-semibold ${heading}`}>{title}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${muted}`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported chains */}
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-3 ${heading}`}>Supported chains</h3>
              <div className="space-y-2">
                {[
                  { name: 'Arc Testnet', domain: 26, color: 'bg-blue-500' },
                  { name: 'Ethereum Sepolia', domain: 0, color: 'bg-slate-400' },
                  { name: 'Base Sepolia', domain: 6, color: 'bg-blue-400' },
                  { name: 'Arbitrum Sepolia', domain: 3, color: 'bg-cyan-400' },
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
                  className="text-purple-400 underline"
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
