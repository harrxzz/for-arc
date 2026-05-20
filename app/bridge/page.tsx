'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BridgeCard } from '@/components/BridgeCard'

export default function BridgePage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBg />
      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-blue-700 font-medium">Powered by Circle CCTP</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight"
          >
            Bridge USDC to{' '}
            <span className="text-blue-700">Arc Network</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 text-lg mb-8"
          >
            Move USDC from Ethereum, Base, or Arbitrum to Arc in ~20 seconds.
          </motion.p>

          {/* How it works */}
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
                <span key={i} className="text-slate-300 text-lg">→</span>
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
                  <span className="text-xs text-slate-400">{item.label}</span>
                </motion.div>
              )
            ))}
          </motion.div>
        </div>

        {/* Bridge card */}
        <BridgeCard />

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
              className="bg-white border border-blue-100 rounded-xl p-4 text-center shadow-sm"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-sm font-semibold text-slate-900 mb-1">{feature.title}</div>
              <div className="text-xs text-slate-400">{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
