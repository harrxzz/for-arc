'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { AgentChat } from '@/components/AgentChat'
import { AgentWalletPanel } from '@/components/AgentWalletPanel'

export default function AgentPage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[color:var(--arc-community-ink)]">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />
      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge mb-5">
              <Bot size={12} className="text-[color:var(--arc-community-orange)]" />
              <span className="text-xs text-[#cfd8e6] font-medium tracking-wide">Track 4 — Agentic Economy</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl sm:text-6xl text-white mb-4 leading-[1.05]"
              style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
            >
              Arc <span className="gradient-text">Agent</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto"
            >
              Chat with an AI agent to execute onchain transactions — swap, send, and bridge on Arc Network.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AgentChat />
            </div>
            <div>
              <AgentWalletPanel />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
