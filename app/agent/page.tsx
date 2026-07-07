'use client'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'
import { AgentChat } from '@/components/AgentChat'
import { AgentWalletPanel } from '@/components/AgentWalletPanel'

export default function AgentPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className={`min-h-screen relative grain-overlay ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />
      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4 overflow-hidden">
        <div className="mesh-gradient" aria-hidden="true" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 badge-live glow-violet">
              <Bot size={13} className="text-arc-violet" />
              <span className="text-xs text-arc-violet font-semibold uppercase tracking-wide">Track 4 — Agentic Economy</span>
              <Sparkles size={12} className="text-arc-violet" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight tracking-tight" style={{ letterSpacing: '-0.035em' }}>Arc <span className="gradient-text">Agent</span></motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">Chat with an AI agent to execute onchain transactions — swap, send, and bridge on Arc Network.</motion.p>
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
