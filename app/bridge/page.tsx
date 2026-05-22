'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, ShieldCheck, Layers } from 'lucide-react'
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
  const card = isDark ? 'glass-dark' : 'glass-light'

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10 pt-24 pb-16 px-4">
        {/* Compact hero */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`text-3xl sm:text-4xl font-bold mb-3 leading-tight ${heading}`}
          >
            Bridge USDC to{' '}
            <span className="text-blue-500">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`text-sm ${muted}`}
          >
            Move USDC from Ethereum, Base, or Arbitrum to Arc in ~20 seconds via Circle CCTP.
          </motion.p>
        </div>

        {/* 2-column layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div>
            <BridgeCard />
            <div className="mt-6">
              <BridgeHistory />
            </div>
          </div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            {/* How it works */}
            <div className={`border rounded-2xl p-5 transition-colors ${card}`}>
              <h3 className={`text-sm font-bold mb-4 ${heading}`}>How it works</h3>
              <div className="space-y-3">
                {[
                  { step: '01', label: 'Select source chain', desc: 'Choose Ethereum, Base, or Arbitrum as your source.' },
                  { step: '02', label: 'Enter amount', desc: 'Minimum 0.51 USDC. Fee is $0.50 flat.' },
                  { step: '03', label: 'Confirm & bridge', desc: 'Approve the transaction in your wallet.' },
                  { step: '✓',  label: 'USDC on Arc', desc: 'Receive native USDC on Arc in ~20 seconds.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.step === '✓'
                        ? 'bg-green-500/15 text-green-500'
                        : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {item.step}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${heading}`}>{item.label}</div>
                      <div className={`text-[11px] mt-0.5 ${muted}`}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: Layers, title: 'Cross-chain', desc: 'ETH, Base, Arbitrum' },
                { Icon: Clock, title: '~20 seconds', desc: 'Fast finality' },
                { Icon: ShieldCheck, title: 'Native USDC', desc: 'Not wrapped' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className={`rounded-xl p-3 text-center border transition-all ${card}`}>
                  <Icon size={18} className="text-blue-500 mx-auto mb-1.5" aria-hidden="true" />
                  <div className={`text-xs font-semibold mb-0.5 ${heading}`}>{title}</div>
                  <div className={`text-[10px] ${muted}`}>{desc}</div>
                </div>
              ))}
            </div>

            {/* CCTP badge */}
            <div className={`border rounded-xl p-4 flex items-center gap-3 ${card}`}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-blue-500" aria-hidden="true" />
              </div>
              <div>
                <div className={`text-xs font-semibold ${heading}`}>Powered by Circle CCTP</div>
                <div className={`text-[11px] ${muted}`}>
                  Battle-tested cross-chain transfer protocol by Circle.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
