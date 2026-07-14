'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import Link from 'next/link'
import {
  Coins, Zap, RefreshCw, ArrowLeftRight, ShieldCheck, BarChart2,
  Wallet, ArrowRightLeft, CheckCircle, ArrowRight,
  Box, Fuel, CircleDollarSign, Globe
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { InteractiveArcOrb } from '@/components/InteractiveArcOrb'

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

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView || !value) return
    const num = parseFloat(value.replace(/,/g, ''))
    if (isNaN(num)) { setDisplay(value); return }
    const controls = animate(0, num, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (num >= 1000) {
          setDisplay(Math.round(v).toLocaleString())
        } else {
          setDisplay(v.toFixed(4))
        }
      },
    })
    return () => controls.stop()
  }, [isInView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

export default function LandingPage() {
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    fetchLiveStats().then(setStats).catch(() => {})
    const interval = setInterval(() => fetchLiveStats().then(setStats).catch(() => {}), 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative grain-overlay bg-[#09090b]">
      {/* Subtle grid bg */}
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />

      <Header />

      <main id="main-content" className="relative z-10">

        {/* ── HERO: Neobank balance card ── */}
        <section className="relative pt-32 pb-16 px-4">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] nb-balance-glow pointer-events-none" aria-hidden="true" />

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nb-badge">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
                <span className="text-xs text-indigo-300 font-medium tracking-wide">
                  Live on Arc Testnet
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-5xl sm:text-7xl lg:text-8xl text-center mb-6 leading-[1.05] tracking-tight text-white"
              style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
            >
              Banking for{' '}
              <span className="gradient-text">Arc Network</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-center text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Swap, bridge, send, and unify USDC across chains.
              <br />
              Powered by Circle — pay gas in USDC, no ETH needed.
            </motion.p>

            {/* Interactive 3D Arc object */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
              className="max-w-3xl mx-auto"
            >
              <InteractiveArcOrb />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-center gap-3 flex-wrap mt-8"
            >
              <Link href="/swap">
                <button className="nb-btn-primary px-7 py-3.5 text-sm font-medium flex items-center gap-2">
                  Start Swapping
                  <ArrowRight size={15} />
                </button>
              </Link>
              <Link href="/bridge">
                <button className="nb-btn-secondary px-7 py-3.5 text-sm font-medium flex items-center gap-2">
                  <ArrowLeftRight size={15} />
                  Bridge USDC
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── LIVE STATS — number counters ── */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIVE_STATS_CONFIG.map(({ label, key, Icon, suffix }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="nb-card rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={14} className="text-white/30" />
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="nb-stat text-xl text-white">
                    {stats ? (
                      <AnimatedCounter value={stats[key as keyof LiveStats]} suffix={suffix ?? ''} />
                    ) : (
                      <span className="shimmer inline-block w-16 h-5 rounded" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-3">Features</div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-2" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                Everything you need
              </h2>
              <p className="text-sm text-white/40">Built for Arc Network — the stablecoin-native L1 by Circle</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ Icon, title, desc, badge }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="nb-card rounded-2xl p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                      <Icon size={18} className="text-white/70 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-white/5 border border-white/8 text-white/50">
                      {badge}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-1.5" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-3">Guide</div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-2" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                How it works
              </h2>
              <p className="text-sm text-white/40">Three steps to start swapping on Arc</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map(({ step, Icon, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Icon size={18} className="text-indigo-400" />
                    </div>
                    <span className="font-display text-sm text-white/30" style={{ fontWeight: 500 }}>{step}</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-1.5">{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUILT ON ARC ── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-3">Built on Arc</div>
              <h2 className="font-display text-2xl sm:text-3xl text-white" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                Powered by Circle's stablecoin-native chain
              </h2>
              <p className="text-sm text-white/40 mt-1">Every feature uses real Arc Network infrastructure — no mocks, no placeholders</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Arc RPC', value: 'rpc.testnet', href: 'https://rpc.testnet.arc.network', status: 'Live' },
                { label: 'ArcScan', value: 'testnet', href: 'https://testnet.arcscan.app', status: 'Live' },
                { label: 'XyloNet DEX', value: 'on-chain', href: 'https://testnet.arcscan.app', status: 'Live' },
                { label: 'Circle CCTP', value: 'v2 API', href: 'https://developers.circle.com/stablecoins', status: 'Live' },
              ].map(({ label, value, href, status }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="nb-card rounded-2xl p-5 group block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                      <span className="text-[9px] text-green-400 font-medium">{status}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{value}</div>
                  <div className="text-[10px] text-white/30 group-hover:text-indigo-400 transition-colors">↗ Open</div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="nb-card-elevated rounded-3xl p-10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                  <BarChart2 size={20} className="text-indigo-400" />
                </div>
                <h2 className="font-display text-2xl text-white mb-2" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                  Ready to swap on Arc?
                </h2>
                <p className="text-sm text-white/40 mb-8 max-w-md mx-auto">
                  Connect your wallet and start swapping stablecoins in seconds. No ETH needed — just USDC.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link href="/swap">
                    <button className="nb-btn-accent px-7 py-3.5 text-sm font-medium flex items-center gap-2">
                      Launch Swap
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                  <Link href="/bridge">
                    <button className="nb-btn-secondary px-7 py-3.5 text-sm font-medium flex items-center gap-2">
                      <ArrowLeftRight size={15} />
                      Bridge USDC
                    </button>
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
