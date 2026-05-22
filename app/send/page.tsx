'use client'

import { motion } from 'framer-motion'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SendCard } from '@/components/SendCard'
import { useTheme } from '@/components/ThemeProvider'
import { Send, Zap, ShieldCheck } from 'lucide-react'

export default function SendPage() {
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
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl sm:text-4xl font-bold mb-3 ${heading}`}
          >
            Send on <span className="text-arc-light">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-sm ${muted}`}
          >
            Send USDC or EURC to any wallet on Arc — instant, sub-second finality.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SendCard />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-4 ${heading}`}>Why send on Arc?</h3>
              <div className="space-y-4">
                {[
                  { Icon: Zap, title: 'Sub-second finality', desc: 'Transactions confirm in under 1 second — no waiting.' },
                  { Icon: ShieldCheck, title: 'USDC as gas', desc: 'Pay fees in USDC. No ETH or other native tokens needed.' },
                  { Icon: Send, title: 'Any EVM wallet', desc: 'Send to any 0x address on Arc Network.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-arc-light/15' : 'bg-white/5'
                    }`}>
                      <Icon size={16} className="text-arc-light" aria-hidden="true" />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${heading}`}>{title}</div>
                      <div className={`text-[11px] mt-0.5 ${muted}`}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-4 ${card}`}>
              <div className={`text-xs font-semibold mb-2 ${heading}`}>Supported tokens</div>
              <div className="flex gap-2">
                {['USDC', 'EURC'].map(sym => (
                  <div key={sym} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                    isDark ? 'bg-white/8 border border-white/10 text-slate-300' : 'bg-white/5 border border-white/8 text-slate-700'
                  }`}>
                    <span>{sym}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
