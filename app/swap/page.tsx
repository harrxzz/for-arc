'use client'

import { motion } from 'framer-motion'
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

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Swap on <span className="text-arc-light">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Powered by XyloNet DEX · Pay gas in USDC
          </motion.p>
        </div>

        {/* 2-column layout: SwapCard kiri, RecentSwaps kanan */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div>
            <SwapCard />
            <div className="mt-6">
              <SwapHistory />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <RecentSwaps />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
