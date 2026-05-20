'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SwapCard } from '@/components/SwapCard'

const stats = [
  { label: 'Chain', value: 'Arc Testnet', icon: '🔵' },
  { label: 'Gas Token', value: 'USDC', icon: '💵' },
  { label: 'Finality', value: '< 1 sec', icon: '⚡' },
  { label: 'Chain ID', value: '5042002', icon: '🔗' },
]

export default function HomePage() {
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
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-700 font-medium">Live on Arc Testnet</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight"
          >
            Swap USDC on{' '}
            <span className="text-blue-700">Arc Network</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 text-lg mb-8"
          >
            Fast, cheap, and secure. Pay gas in USDC — no ETH needed.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm"
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-xs text-slate-400 mb-0.5">{stat.label}</div>
                <div className="text-sm font-bold text-slate-900">{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Swap card */}
        <SwapCard />

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '💵', title: 'USDC as Gas', desc: 'No ETH needed. Pay all fees in USDC.' },
            { icon: '⚡', title: 'Sub-second', desc: 'Transactions confirm in under 1 second.' },
            { icon: '🔒', title: 'Secure', desc: 'Built on Circle\'s audited infrastructure.' },
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
