'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Coins, Zap, RefreshCw, ArrowLeftRight, ShieldCheck, BarChart2,
  Wallet, ArrowRightLeft, CheckCircle, Rocket,
  Box, Fuel, CircleDollarSign, ArrowRight
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
  const tokenCount = tokenData.items?.length ?? 0
  return {
    blockNumber: blockNum.toLocaleString(),
    totalTxs: (blockNum * 3).toLocaleString(),
    totalTokens: tokenCount.toString(),
    gasPrice: gasPriceGwei,
  }
}

const FEATURES = [
  {
    Icon: Coins,
    title: 'USDC as Gas',
    desc: 'No ETH needed. Pay all transaction fees in USDC — the stablecoin you already hold.',
    badge: 'Unique to Arc',
  },
  {
    Icon: Zap,
    title: 'Sub-second Finality',
    desc: 'Transactions confirm in under 1 second. No waiting, no uncertainty.',
    badge: '< 1 sec',
  },
  {
    Icon: RefreshCw,
    title: 'XyloNet DEX',
    desc: "Real on-chain swaps powered by XyloNet — Arc's native DEX with live quotes and price impact.",
    badge: 'Live',
  },
  {
    Icon: ArrowLeftRight,
    title: 'Cross-chain Bridge',
    desc: 'Bridge USDC from Ethereum, Base, or Arbitrum to Arc in ~20 seconds via Circle CCTP.',
    badge: 'CCTP',
  },
  {
    Icon: ShieldCheck,
    title: 'Circle Infrastructure',
    desc: "Built on Circle's audited, battle-tested blockchain infrastructure.",
    badge: 'Audited',
  },
  {
    Icon: BarChart2,
    title: 'Transaction History',
    desc: 'Track all your swaps and bridges in one place with live ArcScan data.',
    badge: 'Real-time',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: Wallet,
    title: 'Connect Wallet',
    desc: 'Connect MetaMask, OKX, Rabby, or any EVM wallet. Or use email/Google via Privy.',
  },
  {
    step: '02',
    Icon: ArrowRightLeft,
    title: 'Swap or Bridge',
    desc: 'Swap tokens on Arc via XyloNet DEX, or bridge USDC from other chains.',
  },
  {
    step: '03',
    Icon: CheckCircle,
    title: 'Done in seconds',
    desc: 'Transactions confirm in under 1 second. Gas paid in USDC — no ETH needed.',
  },
]

const LIVE_STATS_CONFIG = [
  { label: 'Latest Block', key: 'blockNumber', Icon: Box },
  { label: 'Est. Transactions', key: 'totalTxs', Icon: RefreshCw },
  { label: 'ERC-20 Tokens', key: 'totalTokens', Icon: CircleDollarSign, suffix: '+' },
  { label: 'Gas Price', key: 'gasPrice', Icon: Fuel, suffix: ' Gwei' },
]

export default function LandingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    fetchLiveStats().then(setStats).catch(() => {})
    const interval = setInterval(() => {
      fetchLiveStats().then(setStats).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const card = isDark
    ? 'bg-white/5 border border-white/10 hover:border-white/20'
    : 'bg-white border border-blue-100 hover:border-blue-200 shadow-sm'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <AnimatedBg />
      <Header />

      <main id="main-content" className="relative z-10">

        {/* ── HERO ── */}
        <section className="pt-32 pb-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-blue-500 font-medium">Live on Arc Testnet</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-5xl sm:text-6xl font-bold mb-6 leading-tight ${heading}`}
            >
              Swap & Bridge USDC{' '}
              <span className="text-blue-500">on Arc Network</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg mb-10 max-w-xl mx-auto ${muted}`}
            >
              The fastest way to swap stablecoins on Arc — powered by XyloNet DEX.
              Pay gas in USDC. No ETH needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link href="/swap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Start Swapping
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/bridge">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl transition-colors text-sm border ${
                    isDark
                      ? 'border-white/20 text-white hover:bg-white/10'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <ArrowLeftRight size={16} />
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
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className={`rounded-xl p-4 transition-all ${card}`}
              >
                <Icon size={18} className="text-blue-500 mb-2" />
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${muted}`}>{label}</div>
                <div className={`text-sm font-bold ${heading}`}>
                  {stats ? `${stats[key as keyof LiveStats]}${suffix ?? ''}` : '—'}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl font-bold mb-3 ${heading}`}>Everything you need</h2>
              <p className={`text-sm ${muted}`}>Built for Arc Network — the stablecoin-native L1</p>
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
                  <Tilt3DCard className={`rounded-xl p-5 transition-all ${card}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-blue-500/15' : 'bg-blue-50'
                      }`}>
                        <Icon size={18} className="text-blue-500" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-medium">
                        {badge}
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mb-1.5 ${heading}`}>{title}</h3>
                    <p className={`text-xs leading-relaxed ${muted}`}>{desc}</p>
                  </Tilt3DCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl font-bold mb-3 ${heading}`}>How it works</h2>
              <p className={`text-sm ${muted}`}>Three steps to start swapping on Arc</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                    isDark ? 'bg-white/10' : 'bg-blue-50'
                  }`}>
                    <Icon size={24} className="text-blue-500" />
                  </div>
                  <div className="text-blue-500 text-xs font-bold mb-1">{step}</div>
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
              className={`rounded-2xl p-10 border ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Rocket size={26} className="text-blue-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${heading}`}>
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
                    className="flex items-center gap-2 px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Launch Swap
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
                <Link href="/bridge">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-colors text-sm border ${
                      isDark
                        ? 'border-white/20 text-white hover:bg-white/10'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <ArrowLeftRight size={16} />
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
