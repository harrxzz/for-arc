'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BridgeCard } from '@/components/BridgeCard'
import { BridgeHistory } from '@/components/BridgeHistory'
import { useTheme } from '@/components/ThemeProvider'

export default function BridgePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-blue-100 shadow-sm'

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-blue-500 font-medium">Powered by Circle CCTP</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-5xl font-bold mb-4 leading-tight ${heading}`}
          >
            Bridge USDC to{' '}
            <span className="text-blue-500">Arc Network</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg mb-8 ${muted}`}
          >
            Move USDC from Ethereum, Base, or Arbitrum to Arc in ~20 seconds.
          </motion.p>

          {/* How it works steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-12 flex-wrap"
          >
            {[
              { step: '1', label: 'Select source chain' },
              { step: '→', label: '' },
              { step: '2', label: 'Enter amount' },
              { step: '→', label: '' },
              { step: '3', label: 'Confirm & bridge' },
              { step: '→', label: '' },
              { step: '✓', label: 'USDC on Arc' },
            ].map((item, i) => (
              item.step === '→' ? (
                <span key={i} className={`text-lg ${isDark ? 'text-white/20' : 'text-slate-300'}`}>→</span>
              ) : (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <span className={`text-xs ${muted}`}>{item.label}</span>
                </motion.div>
              )
            ))}
          </motion.div>
        </div>

        {/* Bridge card */}
        <BridgeCard />

        {/* Bridge history */}
        <BridgeHistory />

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '🌉', title: 'Cross-chain', desc: 'Bridge from Ethereum, Base, or Arbitrum.' },
            { icon: '⏱️', title: '~20 seconds', desc: 'Fast finality via Circle CCTP protocol.' },
            { icon: '🔐', title: 'Native USDC', desc: 'Receive native USDC, not wrapped tokens.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ y: -3 }}
              className={`rounded-xl p-4 text-center border transition-all ${card}`}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className={`text-sm font-semibold mb-1 ${heading}`}>{feature.title}</div>
              <div className={`text-xs ${muted}`}>{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
