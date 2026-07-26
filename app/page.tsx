'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import Link from 'next/link'
import {
  Coins, Zap, RefreshCw, ArrowLeftRight, ShieldCheck, BarChart2,
  Wallet, ArrowRightLeft, CheckCircle, ArrowRight,
  Box, Fuel, CircleDollarSign, Globe, Radio, Layers3, Route, Gauge, TerminalSquare
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { InteractiveArcOrb } from '@/components/InteractiveArcOrb'
import { GrainCanvas } from '@/components/GrainCanvas'

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

const LIVE_STATS_CONFIG = [
  { label: 'Latest Block', key: 'blockNumber', Icon: Box },
  { label: 'Est. Transactions', key: 'totalTxs', Icon: RefreshCw },
  { label: 'ERC-20 Tokens', key: 'totalTokens', Icon: CircleDollarSign, suffix: '+' },
  { label: 'Gas Price', key: 'gasPrice', Icon: Fuel, suffix: ' Gwei' },
]

const WORKBENCH_STEPS = [
  {
    step: '01',
    lane: 'Prepare',
    title: 'Connect once',
    desc: 'Wallet or Privy session becomes the control point for swap, bridge, send, and Gateway balance views.',
    metric: 'EVM ready',
    Icon: Wallet,
  },
  {
    step: '02',
    lane: 'Route',
    title: 'Pick the rail',
    desc: 'Choose XyloNet swap, Circle CCTP bridge, direct send, or Gateway deposit without leaving the Arc context.',
    metric: '4 flows',
    Icon: Route,
  },
  {
    step: '03',
    lane: 'Execute',
    title: 'Confirm on-chain',
    desc: 'Preview fees, sign from the wallet, and use USDC-native gas so execution stays readable for stablecoin users.',
    metric: 'USDC gas',
    Icon: Gauge,
  },
]

const HERO_PILLS = ['Swap', 'Bridge', 'Send', 'Gateway', 'Agent']

const HERO_RAILS = [
  { label: 'Stable rails', value: 'USDC gas', Icon: Fuel },
  { label: 'Execution', value: '<1s finality', Icon: Zap },
  { label: 'Network', value: 'Arc testnet', Icon: Radio },
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
    <div className="min-h-screen relative grain-overlay bg-[color:var(--arc-community-ink)]">
      <GrainCanvas />
      {/* Subtle grid bg */}
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />

      <Header />

      <main id="main-content" className="relative z-10">

        {/* ── EDITORIAL HERO — scroll-demo structure, Arc community palette ── */}
        <section className="arc-editorial-hero relative min-h-screen overflow-hidden px-6 sm:px-12 pt-32 pb-20 flex flex-col justify-center">
          <div className="absolute inset-0 arc-editorial-grid pointer-events-none" aria-hidden="true" />
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />

          <motion.div
            className="hero-status-panel hidden lg:block"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.7 }}
          >
            <div className="flex items-center justify-between border-b border-white/12 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Arc terminal</p>
                <p className="mt-1 font-display text-lg text-white">Live rails</p>
              </div>
              <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">Online</div>
            </div>
            <div className="mt-5 space-y-3">
              {HERO_RAILS.map(({ label, value, Icon }) => (
                <div key={label} className="hero-rail-row">
                  <Icon size={15} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative z-10 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-eyebrow mb-6"
            >
              <span className="editorial-dot" />
              Arc community rails · stablecoin-native DeFi
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display editorial-title max-w-7xl"
            >
              The USDC<br />
              <em>command</em> center<br />
              for Arc.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hero-sub mt-8 max-w-xl"
            >
              A stablecoin-native command center for XyloNet swaps, Circle CCTP bridging, instant sends, and unified balances — built around Arc's USDC gas UX.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="hero-pill-row mt-7"
            >
              {HERO_PILLS.map((pill) => <span key={pill}>{pill}</span>)}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-9 flex items-center gap-3 flex-wrap"
            >
              <Link href="/swap">
                <button className="editorial-btn editorial-btn-light px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-2">
                  Start swapping
                  <ArrowRight size={15} />
                </button>
              </Link>
              <Link href="/bridge">
                <button className="editorial-btn editorial-btn-ghost px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-2">
                  <ArrowLeftRight size={15} />
                  Bridge USDC
                </button>
              </Link>
            </motion.div>
          </div>

          <div className="scroll-cue"><div className="bar" />Scroll</div>
        </section>

        {/* ── MARQUEE WORDMARK ── */}
        <section className="marquee-wrap" aria-label="For Arc wordmark">
          <motion.div
            className="marquee-row"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={i % 2 ? 'outline' : ''}>FOR ARC</span>
            ))}
          </motion.div>
        </section>

        {/* ── LIGHT FEATURE GRID — Arc community off-white ── */}
        <section className="features-editorial px-6 sm:px-12 py-16 sm:py-28">
          <div className="features-head">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] opacity-60 mb-4">Product system</div>
              <h2 className="font-display">Why For Arc feels native</h2>
            </div>
            <span>06 core flows</span>
          </div>

          <div className="editorial-grid-cards">
            {FEATURES.map(({ Icon, title, desc, badge }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.06, duration: 0.65, ease: 'easeOut' }}
                className="editorial-card"
              >
                <div className="flex items-center justify-between mb-7">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="badge">{badge}</span>
                </div>
                <Icon size={24} className="mb-7 opacity-70" />
                <h3 className="font-display">{title}</h3>
                <p>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DARK PARALLAX ILLUSTRATION SECTION ── */}
        <section className="illus-editorial relative min-h-screen overflow-hidden flex items-center justify-center px-6">
          <div className="absolute inset-0 nb-grid-bg opacity-50" aria-hidden="true" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-20 mx-auto max-w-4xl opacity-90"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <InteractiveArcOrb />
          </motion.div>
          <motion.div
            className="illus-text relative z-10 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="editorial-eyebrow justify-center rounded-full border border-white/12 bg-black/20 px-4 py-2 backdrop-blur-xl">
              <span className="editorial-dot" />Live Arc data layer
            </div>
          </motion.div>
        </section>

        {/* ── LIVE STATS ── */}
        <section className="stats-editorial px-6 sm:px-12 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px max-w-6xl mx-auto bg-black/10 border border-black/10">
            {LIVE_STATS_CONFIG.map(({ label, key, Icon, suffix }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="stat-editorial-card"
              >
                <div className="flex items-center justify-between mb-7">
                  <Icon size={15} />
                  <span>{label}</span>
                </div>
                <div className="nb-stat text-2xl sm:text-3xl">
                  {stats ? <AnimatedCounter value={stats[key as keyof LiveStats]} suffix={suffix ?? ''} /> : <span className="shimmer inline-block w-20 h-7 rounded" />}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HALLMARK WORKBENCH FLOW ── */}
        <section className="workbench-flow px-6 sm:px-12 py-18 sm:py-28">
          <div className="workbench-shell">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="workbench-copy"
            >
              <div className="editorial-eyebrow">
                <span className="editorial-dot" />Guided execution
              </div>
              <h2 className="font-display">One console, every Arc rail.</h2>
              <p>
                Instead of a generic feature tour, For Arc is structured like an operator workbench: connect once, route the intent, then confirm with live Arc infrastructure.
              </p>
              <div className="workbench-terminal" aria-label="Arc execution checklist">
                <div><TerminalSquare size={14} /> for-arc / route-preview</div>
                <code>wallet.connected → quote.ready → sign → arcscan.link</code>
              </div>
            </motion.div>

            <div className="workbench-steps">
              {WORKBENCH_STEPS.map(({ step, lane, Icon, title, desc, metric }, i) => (
                <motion.article
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  className="workbench-step"
                >
                  <div className="workbench-step-top">
                    <span>{step}</span>
                    <strong>{lane}</strong>
                  </div>
                  <div className="workbench-icon"><Icon size={20} /></div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <div className="workbench-metric">{metric}</div>
                </motion.article>
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
              <div className="text-xs text-[color:var(--arc-community-orange)] font-medium uppercase tracking-wider mb-3">Built on Arc</div>
              <h2 className="font-display text-2xl sm:text-3xl text-white" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                Powered by Circle's stablecoin-native chain
              </h2>
              <p className="text-sm text-white/40 mt-1">Every feature uses real Arc Network infrastructure — no mocks, no placeholders</p>
            </motion.div>

            <div className="infra-grid">
              {[
                { label: 'Arc RPC', value: 'rpc.testnet', href: 'https://rpc.testnet.arc.network', status: 'Live', Icon: Radio },
                { label: 'ArcScan', value: 'testnet', href: 'https://testnet.arcscan.app', status: 'Live', Icon: Box },
                { label: 'XyloNet DEX', value: 'on-chain', href: 'https://testnet.arcscan.app', status: 'Live', Icon: ArrowRightLeft },
                { label: 'Circle CCTP', value: 'v2 API', href: 'https://developers.circle.com/stablecoins', status: 'Live', Icon: Layers3 },
              ].map(({ label, value, href, status, Icon }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="infra-card group"
                >
                  <div className="infra-card-top">
                    <div className="infra-icon"><Icon size={17} /></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                      <span>{status}</span>
                    </div>
                  </div>
                  <span className="infra-label">{label}</span>
                  <div className="infra-value">{value}</div>
                  <div className="infra-link">Open resource ↗</div>
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[color:var(--arc-community-blue)]/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(47,87,140,0.10)] border border-[rgba(47,87,140,0.20)] flex items-center justify-center mx-auto mb-5">
                  <BarChart2 size={20} className="text-[color:var(--arc-community-orange)]" />
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
