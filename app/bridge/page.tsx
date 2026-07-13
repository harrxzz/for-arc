'use client'

import { motion } from 'framer-motion'
import { Clock, ShieldCheck, Layers, ArrowLeftRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BridgeCard } from '@/components/BridgeCard'
import { BridgeHistory } from '@/components/BridgeHistory'

export default function BridgePage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[#09090b]">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />

      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge mb-5">
            <ArrowLeftRight size={12} className="text-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium tracking-wide">Circle CCTP</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-4xl sm:text-6xl text-white mb-4 leading-[1.05]"
            style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
          >
            Bridge USDC to{' '}
            <span className="gradient-text">Arc Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-white/40"
          >
            Move USDC from Ethereum, Base, or Arbitrum to Arc in ~20 seconds via Circle CCTP.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div>
            <BridgeCard />
            <div className="mt-6">
              <BridgeHistory />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="nb-card rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">How it works</h3>
              <div className="space-y-3">
                {[
                  { step: '01', label: 'Select source chain', desc: 'Choose Ethereum, Base, or Arbitrum as your source.' },
                  { step: '02', label: 'Enter amount', desc: 'Minimum 0.51 USDC. Fee is $0.50 flat.' },
                  { step: '03', label: 'Confirm & bridge', desc: 'Approve the transaction in your wallet.' },
                  { step: '✓',  label: 'USDC on Arc', desc: 'Receive native USDC on Arc in ~20 seconds.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      item.step === '✓'
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {item.step}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{item.label}</div>
                      <div className="text-[11px] mt-0.5 text-white/40">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: Layers, title: 'Cross-chain', desc: 'ETH, Base, Arbitrum' },
                { Icon: Clock, title: '~20 seconds', desc: 'Fast finality' },
                { Icon: ShieldCheck, title: 'Native USDC', desc: 'Not wrapped' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="nb-card rounded-xl p-3 text-center">
                  <Icon size={18} className="text-indigo-400 mx-auto mb-1.5" aria-hidden="true" />
                  <div className="text-xs font-medium text-white mb-0.5">{title}</div>
                  <div className="text-[10px] text-white/40">{desc}</div>
                </div>
              ))}
            </div>

            <div className="nb-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Powered by Circle CCTP</div>
                <div className="text-[11px] text-white/40">
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
