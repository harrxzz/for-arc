'use client'

import { motion } from 'framer-motion'
import { ArrowRightLeft, Sparkles, Zap } from 'lucide-react'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SwapCard } from '@/components/SwapCard'
import { SwapHistory } from '@/components/SwapHistory'
import { RecentSwaps } from '@/components/RecentSwaps'
import { useTheme } from '@/components/ThemeProvider'

export default function SwapPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`min-h-screen relative grain-overlay ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4 overflow-hidden">
        <div className="mesh-gradient" aria-hidden="true" />

        <section className="max-w-3xl mx-auto text-center mb-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 badge-live glow-violet"
          >
            <ArrowRightLeft size={13} className="text-arc-violet" />
            <span className="text-xs text-arc-violet font-semibold uppercase tracking-wide">XyloNet DEX</span>
            <Sparkles size={12} className="text-arc-violet" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl sm:text-6xl font-black mb-4 leading-tight tracking-tight ${heading}`}
            style={{ letterSpacing: '-0.035em' }}
          >
            Swap on <span className="gradient-text">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-sm sm:text-base ${muted}`}
          >
            Real on-chain quotes, USDC gas, and sub-second execution on Arc.
          </motion.p>
        </section>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start relative z-10">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <SwapCard />
            <div className="mt-6">
              <SwapHistory />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="rounded-2xl p-4 glass-violet hover-glow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-arc-violet/15 flex items-center justify-center flex-shrink-0 glow-violet">
                  <Zap size={17} className="text-arc-violet" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${heading}`}>Built for stablecoin routing</div>
                  <p className={`text-xs mt-1 leading-relaxed ${muted}`}>
                    Swap USDC ↔ EURC through Arc-native liquidity with transparent fee preview and live recent swaps.
                  </p>
                </div>
              </div>
            </div>
            <RecentSwaps />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}