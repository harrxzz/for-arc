'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Coins, Zap, RefreshCw, ArrowLeftRight, ShieldCheck, BarChart2,
  Wallet, ArrowRightLeft, CheckCircle, ArrowRight,
  Box, Fuel, CircleDollarSign, Globe, Send
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
  { Icon: Coins, title: 'USDC as Gas', desc: 'No ETH needed. Pay all fees in USDC — the stablecoin you already hold.', badge: 'Unique to Arc' },
  { Icon: Zap, title: 'Sub-second Finality', desc: 'Transactions confirm in under 1 second. No waiting, no uncertainty.', badge: '< 1 sec' },
  { Icon: RefreshCw, title: 'XyloNet DEX', desc: "Real on-chain swaps powered by XyloNet — Arc's native DEX with live quotes.", badge: 'Live' },
  { Icon: ArrowLeftRight, title: 'Cross-chain Bridge', desc: 'Bridge USDC from Ethereum, Base, or Arbitrum to Arc via Circle CCTP.', badge: 'CCTP' },
  { Icon: Globe, title: 'Unified Balance', desc: 'Deposit USDC from any chain into Circle Gateway — one balance, instant transfers.', badge: 'Gateway' },
  { Icon: ShieldCheck, title: 'Circle Infrastructure', desc: "Built on Circle's audited, battle-tested blockchain infrastructure.", badge: 'Audited' },
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
  { href: '/swap', Icon: ArrowRightLeft, label: 'Swap', desc: 'USDC ↔ EURC', color: 'from-indigo-500 to-violet-600' },
  { href: '/bridge', Icon: ArrowLeftRight, label: 'Bridge', desc: 'Cross-chain CCTP', color: 'from-blue-500 to-indigo-600' },
  { href: '/send', Icon: Send, label: 'Send', desc: 'Wallet to wallet', color: 'from-violet-500 to-purple-600' },
  { href: '/unified-balance', Icon: Globe, label: 'Gateway', desc: 'Unified balance', color: 'from-purple-500 to-pink-600' },
]

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
    <div className={`min-h-screen relative ${isDark ? 'bg-[#07071a]' : 'bg-slate-50'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10">

        {/* ── HERO ── */}
        <section className="pt-36 pb-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 badge-live"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-300 font-medium tracking-wide">Live on Arc Testnet</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className={`text-5xl sm:text-7xl font-800 mb-6 leading-[1.05] tracking-tight ${heading}`}
              style={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              The DeFi Hub for{' '}
              <span className="gradient-text">Arc Network</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${muted}`}
            >
              Swap, bridge, send, and unify your USDC across chains.
              Powered by Circle — pay gas in USDC, no ETH needed.
            </motion.p>

            {/* Quick action cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10"
            >
              {QUICK_ACTIONS.map(({ href, Icon, label, desc, color }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-2xl p-4 cursor-pointer transition-all ${card} group`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 mx-auto shadow-lg`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className={`text-sm font-700 ${heading}`} style={{ fontWeight: 700 }}>{label}</div>
                    <div className={`text-[11px] mt-0.5 ${muted}`}>{desc}</div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link href="/swap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3.5 glass-btn-primary text-white font-semibold rounded-2xl text-sm"
                >
                  Start Swapping
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
              <Link href="/bridge">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-8 py-3.5 font-semibold rounded-2xl text-sm border transition-colors ${
                    isDark
                      ? 'border-white/10 text-white hover:bg-white/8'
                      : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
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
                transition={{ delay: 0.35 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className={`rounded-2xl p-4 transition-all ${card}`}
              >
                <Icon size={16} className="text-indigo-400 mb-2" />
                <div className={`text-[10px] uppercase tracking-widest mb-1 ${muted}`}>{label}</div>
                <div className={`text-sm font-bold tabular-nums ${heading}`}>
                  {stats ? `${stats[key as keyof LiveStats]}${suffix ?? ''}` : (
                    <span className="shimmer inline-block w-16 h-4 rounded" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${heading}`} style={{ letterSpacing: '-0.02em' }}>
                Everything you need
              </h2>
              <p className={`text-sm ${muted}`}>Built for Arc Network — the stablecoin-native L1 by Circle</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ Icon, title, desc, badge }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Tilt3DCard className={`rounded-2xl p-5 h-full transition-all ${card}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark ? 'bg-indigo-500/15' : 'bg-indigo-50'
                      }`}>
                        <Icon size={18} className="text-indigo-400" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold badge-live">
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
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    isDark ? 'bg-indigo-500/15' : 'bg-indigo-50'
                  }`}>
                    <Icon size={22} className="text-indigo-400" />
                  </div>
                  <div className="text-indigo-400 text-xs font-bold mb-1 tracking-widest">{step}</div>
                  <h3 className={`text-sm font-bold mb-2 ${heading}`}>{title}</h3>
                  <p className={`text-xs leading-relaxed ${muted}`}>{desc}</p>
                </motion.div>
              ))}
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
              className={`rounded-3xl p-10 ${card} relative overflow-hidden`}
            >
              {/* Glow bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5 pointer-events-none" />

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg`}>
                <BarChart2 size={24} className="text-white" />
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
                    className="flex items-center gap-2 px-8 py-3 glass-btn-primary text-white font-semibold rounded-2xl text-sm"
                  >
                    Launch Swap
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <Link href="/bridge">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-2xl text-sm border transition-colors ${
                      isDark
                        ? 'border-white/10 text-white hover:bg-white/8'
                        : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <ArrowLeftRight size={15} />
                    Bridge USDC
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
