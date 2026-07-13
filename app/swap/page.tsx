'use client'

import { motion } from 'framer-motion'
import { ArrowRightLeft, Zap } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SwapCard } from '@/components/SwapCard'
import { SwapHistory } from '@/components/SwapHistory'
import { RecentSwaps } from '@/components/RecentSwaps'

export default function SwapPage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[#09090b]">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <section className="max-w-3xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge mb-5"
          >
            <ArrowRightLeft size={12} className="text-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium tracking-wide">XyloNet DEX</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-4xl sm:text-6xl text-white mb-4 leading-[1.05]"
            style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
          >
            Swap on <span className="gradient-text">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-white/40"
          >
            Real on-chain quotes, USDC gas, and sub-second execution on Arc.
          </motion.p>
        </section>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <SwapCard />
            <div className="mt-6">
              <SwapHistory />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="nb-card rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={17} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Built for stablecoin routing</div>
                  <p className="text-xs mt-1 leading-relaxed text-white/40">
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
