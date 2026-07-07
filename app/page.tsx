'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Coins, Zap, RefreshCw, ArrowLeftRight, ShieldCheck, BarChart2,
  Wallet, ArrowRightLeft, CheckCircle, ArrowRight, Bot,
  Box, Fuel, CircleDollarSign, Globe, Send, Sparkles
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AnimatedBg } from '@/components/AnimatedBg'
import { useTheme } from '@/components/ThemeProvider'
import { Tilt3DCard } from '@/components/Tilt3DCard'

const ARCSCAN = 'https://testnet.arcscan.app'
const RPC = 'https://rpc.testnet.arc.network'

interface LiveStats {
  blockNumber: string
  totalTxs: string
  totalTokens: string
  gasPrice: string
}

async function fetchLiveStats(): Promise<LiveStats> {
  const [blockRes, gasRes] = await Promise.all([
    fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
    }),
    fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 2 }),
    }),
  ])
  const blockData = await blockRes.json()
  const gasData = await gasRes.json()
  const blockNum = parseInt(blockData.result, 16)
  const gasPriceGwei = (parseInt(gasData.result, 16) / 1e9).toFixed(4)
  const tokenRes = await fetch(`${ARCSCAN}/api/v2/tokens?type=ERC-20`)
  const tokenData = await tokenRes.json()
  return {
    blockNumber: blockNum.toLocaleString(),
    totalTxs: (blockNum * 3).toLocaleString(),
    totalTokens: (tokenData.items?.length ?? 0).toString(),
    gasPrice: gasPriceGwei,
  }
}

const FEATURES = [
  { Icon: Coins, title: 'USDC as Gas', desc: 'No ETH needed. Pay all fees in USDC — the stablecoin you already hold.', badge: 'Unique to Arc', color: '#9F72FF' },
  { Icon: Zap, title: 'Sub-second Finality', desc: 'Transactions confirm in under 1 second. No waiting, no uncertainty.', badge: '< 1 sec', color: '#ACC6E9' },
  { Icon: RefreshCw, title: 'XyloNet DEX', desc: "Real on-chain swaps powered by XyloNet — Arc's native DEX with live quotes.", badge: 'Live', color: '#9F72FF' },
  { Icon: ArrowLeftRight, title: 'Cross-chain Bridge', desc: 'Bridge USDC from Ethereum, Base, or Arbitrum to Arc via Circle CCTP.', badge: 'CCTP', color: '#ACC6E9' },
  { Icon: Globe, title: 'Unified Balance', desc: 'Deposit USDC from any chain into Circle Gateway — one balance, instant transfers.', badge: 'Gateway', color: '#9F72FF' },
  { Icon: ShieldCheck, title: 'Circle Infrastructure', desc: "Built on Circle's audited, battle-tested blockchain infrastructure.", badge: 'Audited', color: '#ACC6E9' },
]

const HOW_IT_WORKS = [
  { step: '01', Icon: Wallet, title: 'Connect Wallet', desc: 'Connect MetaMask, OKX, Rabby, or any EVM wallet. Or use email/Google via Privy.' },
  { step: '02', Icon: ArrowRightLeft, title: 'Swap or Bridge', desc: 'Swap tokens on Arc via XyloNet DEX, or bridge USDC from other chains.' },
  { step: '03', Icon: CheckCircle, title: 'Done in seconds', desc: 'Transactions confirm in under 1 second. Gas paid in USDC — no ETH needed.' },
]

const LIVE_STATS_CONFIG = [
  { label: 'Latest Block', key: 'blockNumber', Icon: Box },
  { label: 'Est. Transactions', key: 'totalTxs', Icon: RefreshCw },
  { label: 'ERC-20 Tokens', key: 'totalTokens', Icon: CircleDollarSign, suffix: '+' },
  { label: 'Gas Price', key: 'gasPrice', Icon: Fuel, suffix: ' Gwei' },
]

const QUICK_ACTIONS = [
  { href: '/swap', Icon: ArrowRightLeft, label: 'Swap', desc: 'USDC ↔ EURC' },
  { href: '/bridge', Icon: ArrowLeftRight, label: 'Bridge', desc: 'Cross-chain CCTP' },
  { href: '/send', Icon: Send, label: 'Send', desc: 'Wallet to wallet' },
  { href: '/unified-balance', Icon: Globe, label: 'Gateway', desc: 'Unified balance' },
  { href: '/agent', Icon: Bot, label: 'Agent', desc: 'AI-powered executor' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function LandingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    fetchLiveStats().then(setStats).catch(() => {})
    const interval = setInterval(() => fetchLiveStats().then(setStats).catch(() => {}), 15000)
    return () => clearInterval(interval)
  }, [])

  const card = isDark ? 'glass-dark' : 'glass-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  return (
    <div className={`min-h-screen relative grain-overlay ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10">

        {/* ── HERO ── */}
        <section className="relative pt-36 pb-20 px-4 text-center overflow-hidden">
          {/* Mesh gradient blobs */}
          <div className="mesh-gradient" aria-hidden="true" />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 badge-live glow-violet"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-arc-violet animate-pulse" />
              <span className="text-xs text-arc-violet font-medium tracking-wide uppercase">
                Live on Arc Testnet
              </span>
              <Sparkles size={12} className="text-arc-violet" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-900 mb-6 leading-[1.02] tracking-tight"
              style={{ fontWeight: 900, letterSpacing: '-0.03em' }}
            >
              The DeFi Hub for{' '}
              <span className="gradient-text">Arc Network</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${muted}`}
            >
              Swap, bridge, send, and unify your USDC across chains.
              Powered by Circle — pay gas in USDC, no ETH needed.
            </motion.p>

            {/* Quick action cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto mb-10"
            >
              {QUICK_ACTIONS.map(({ href, Icon, label, desc }) => (
                <motion.div key={href} variants={itemVariants}>
                  <Link href={href}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      className={`rounded-2xl p-4 cursor-pointer transition-all hover-glow ${card}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-violet/20 to-arc-violet/5 flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <Icon size={18} className="text-arc-violet" />
                      </div>
                      <div className={`text-sm font-bold ${heading}`} style={{ fontWeight: 700 }}>{label}</div>
                      <div className={`text-[11px] mt-0.5 ${muted}`}>{desc}</div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link href="/swap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3.5 glass-btn-primary text-white font-semibold rounded-2xl text-sm glow-violet"
                >
                  Start Swapping
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
              <Link href="/bridge">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3.5 font-semibold rounded-2xl text-sm btn-secondary"
                >
                  <ArrowLeftRight size={15} />
                  Bridge USDC
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── LIVE STATS ── */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LIVE_STATS_CONFIG.map(({ label, key, Icon, suffix }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={{ y: -2, borderColor: 'rgba(159,114,255,0.3)' }}
                className={`rounded-2xl p-4 transition-all ${card}`}
              >
                <Icon size={16} className="text-arc-violet mb-2" />
                <div className={`text-[10px] uppercase tracking-widest mb-1 ${muted} text-arc-violet/70`}>{label}</div>
                <div className={`text-sm font-bold tabular-nums gradient-text-subtle`}>
                  {stats ? `${stats[key as keyof LiveStats]}${suffix ?? ''}` : (
                    <span className="shimmer inline-block w-16 h-4 rounded" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 px-4 relative">
          <div className="dots-bg absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-live mb-4">
                <Sparkles size={12} className="text-arc-violet" />
                <span className="text-[10px] uppercase tracking-widest text-arc-violet font-semibold">Features</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${heading}`} style={{ letterSpacing: '-0.02em' }}>
                Everything you need
              </h2>
              <p className={`text-sm ${muted}`}>Built for Arc Network — the stablecoin-native L1 by Circle</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ Icon, title, desc, badge, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Tilt3DCard className={`rounded-2xl p-5 h-full transition-all hover-glow ${card}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: `${color}15` }}
                      >
                        <Icon size={18} style={{ color }} aria-hidden="true" />
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold`}
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          color: color,
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mb-2 ${heading}`}>{title}</h3>
                    <p className={`text-xs leading-relaxed ${muted}`}>{desc}</p>
                  </Tilt3DCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-live mb-4">
                <Sparkles size={12} className="text-arc-violet" />
                <span className="text-[10px] uppercase tracking-widest text-arc-violet font-semibold">Guide</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${heading}`} style={{ letterSpacing: '-0.02em' }}>
                How it works
              </h2>
              <p className={`text-sm ${muted}`}>Three steps to start swapping on Arc</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(({ step, Icon, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative w-fit mx-auto mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arc-violet/20 to-arc-violet/5 flex items-center justify-center shadow-lg glow-violet">
                      <Icon size={22} className="text-arc-violet" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-arc-violet/20 border border-arc-violet/30 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-arc-violet">{step}</span>
                    </div>
                  </div>
                  <h3 className={`text-sm font-bold mb-2 ${heading}`}>{title}</h3>
                  <p className={`text-xs leading-relaxed ${muted}`}>{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Connector line (desktop) */}
            <div className="hidden sm:block relative h-0 -mt-[200px] z-0" aria-hidden="true">
              <svg className="w-full" viewBox="0 0 600 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="100" y1="20" x2="500" y2="20" stroke="url(#line-grad)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9F72FF" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#9F72FF" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#9F72FF" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-10 glass-violet relative overflow-hidden"
            >
              {/* Glow bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-arc-violet/5 via-transparent to-arc-violet/5 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-arc-violet/30 to-arc-violet/10 flex items-center justify-center mx-auto mb-5 shadow-lg glow-violet">
                  <BarChart2 size={24} className="text-arc-violet" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 tracking-tight ${heading}`} style={{ letterSpacing: '-0.02em' }}>
                  Ready to swap on Arc?
                </h2>
                <p className={`text-sm mb-8 ${muted}`}>
                  Connect your wallet and start swapping stablecoins in seconds.
                  No ETH needed — just USDC.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link href="/swap">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-3 glass-btn-primary text-white font-semibold rounded-2xl text-sm glow-violet"
                    >
                      Launch Swap
                      <ArrowRight size={15} />
                    </motion.button>
                  </Link>
                  <Link href="/bridge">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-3 font-semibold rounded-2xl text-sm btn-secondary"
                    >
                      <ArrowLeftRight size={15} />
                      Bridge USDC
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
