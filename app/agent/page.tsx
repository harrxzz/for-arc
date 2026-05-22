'use client'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/components/ThemeProvider'
import { AgentChat } from '@/components/AgentChat'
import { AgentWalletPanel } from '@/components/AgentWalletPanel'

export default function AgentPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-arc-light/10 border border-arc-light/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-arc-light animate-pulse" />
              <span className="text-xs text-arc-light font-medium">Track 4 — Agentic Economy</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Arc Agent</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Chat with an AI agent to execute onchain transactions — swap, send, and bridge on Arc Network.</p>
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
