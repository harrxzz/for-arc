'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SendCard } from '@/components/SendCard'
import { Send, Zap, ShieldCheck } from 'lucide-react'

export default function SendPage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[color:var(--arc-community-ink)]">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge mb-5">
            <Send size={12} className="text-[color:var(--arc-community-orange)]" />
            <span className="text-xs text-[#cfd8e6] font-medium tracking-wide">Instant transfers</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-6xl text-white mb-4 leading-[1.05]"
            style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
          >
            Send on <span className="gradient-text">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-white/40"
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
            <div className="nb-card rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">Why send on Arc?</h3>
              <div className="space-y-4">
                {[
                  { Icon: Zap, title: 'Sub-second finality', desc: 'Transactions confirm in under 1 second — no waiting.' },
                  { Icon: ShieldCheck, title: 'USDC as gas', desc: 'Pay fees in USDC. No ETH or other native tokens needed.' },
                  { Icon: Send, title: 'Any EVM wallet', desc: 'Send to any 0x address on Arc Network.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(47,87,140,0.10)] border border-[rgba(47,87,140,0.20)] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[color:var(--arc-community-orange)]" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{title}</div>
                      <div className="text-[11px] mt-0.5 text-white/40">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nb-card rounded-2xl p-4">
              <div className="text-xs font-medium text-white mb-2">Supported tokens</div>
              <div className="flex gap-2">
                {['USDC', 'EURC'].map(sym => (
                  <div key={sym} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/8 text-white/70">
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
