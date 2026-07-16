'use client'

import { motion } from 'framer-motion'
import { ArrowLeftRight, Bot, CircleDollarSign, Globe, Send, Wallet, Zap } from 'lucide-react'

const cards = [
  {
    title: 'Swap USDC',
    subtitle: 'XyloNet DEX',
    icon: ArrowLeftRight,
    accent: 'from-[rgba(47,87,140,0.25)] to-blue-500/10',
    wide: true,
    body: ['USDC → EURC', 'Quote: 0.9192', 'Gas: USDC'],
  },
  {
    title: 'Bridge',
    subtitle: 'Circle CCTP',
    icon: ArrowLeftRight,
    accent: 'from-cyan-500/20 to-[rgba(38,70,112,0.10)]',
    body: ['Base → Arc', 'ETA: ~20s', 'Native USDC'],
  },
  {
    title: 'Arc Balance',
    subtitle: 'Unified USDC',
    icon: Wallet,
    accent: 'from-white/12 to-[rgba(38,70,112,0.10)]',
    tall: true,
    body: ['$0.00', 'USDC as gas', 'No ETH needed'],
  },
  {
    title: 'AI Agent',
    subtitle: 'Intent parser',
    icon: Bot,
    accent: 'from-[rgba(47,87,140,0.20)] to-[rgba(38,70,112,0.10)]',
    wide: true,
    body: ['“swap 10 USDC”', 'JSON intent', 'Ready'],
  },
  {
    title: 'Send',
    subtitle: 'Sub-second',
    icon: Send,
    accent: 'from-emerald-500/18 to-[rgba(38,70,112,0.10)]',
    body: ['0x…A19B9', 'Instant', 'Finalized'],
  },
  {
    title: 'Gateway',
    subtitle: 'Circle tooling',
    icon: Globe,
    accent: 'from-sky-500/20 to-[rgba(38,70,112,0.10)]',
    tall: true,
    body: ['ETH', 'Base', 'Arbitrum', 'Arc'],
  },
]

function PreviewCard({ card, index }: { card: typeof cards[number]; index: number }) {
  const Icon = card.icon
  return (
    <motion.div
      className={`shrink-0 rounded-[1.6rem] border border-white/10 bg-[rgba(30,29,41,0.72)]/90 overflow-hidden backdrop-blur-xl ${
        card.wide ? 'w-[300px] sm:w-[380px]' : 'w-[230px] sm:w-[280px]'
      } ${card.tall ? 'h-[250px] sm:h-[305px]' : 'h-[205px] sm:h-[250px]'}`}
      style={{ transform: `translateZ(${(index % 3) * 18}px)` }}
      whileHover={{ y: -8, rotateY: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <div className={`h-full relative bg-gradient-to-br ${card.accent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,.12),transparent_34%)]" />
        <div className="relative h-full p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/7 border border-white/10 flex items-center justify-center">
              <Icon size={19} className="text-[#dce5f2]" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
              <span className="text-[10px] text-white/45">Live</span>
            </div>
          </div>

          <div>
            <div className="font-display text-2xl sm:text-3xl text-white leading-none" style={{ fontWeight: 600, letterSpacing: '-0.03em' }}>
              {card.title}
            </div>
            <div className="text-xs text-white/40 mt-1.5">{card.subtitle}</div>
          </div>

          <div className="grid gap-2">
            {card.body.map((item, i) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-black/18 border border-white/8 px-3 py-2">
                <span className="text-[11px] text-white/45">{i === 0 ? 'Primary' : i === 1 ? 'Status' : 'Detail'}</span>
                <span className="text-[11px] text-white/75 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MovingRow({ reverse = false, duration = 28, offset = 0 }: { reverse?: boolean; duration?: number; offset?: number }) {
  const doubled = [...cards, ...cards]
  return (
    <motion.div
      className="flex gap-4 sm:gap-5 w-max"
      initial={{ x: reverse ? '-50%' : `${offset}px` }}
      animate={{ x: reverse ? '0%' : '-50%' }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {doubled.map((card, i) => (
        <PreviewCard key={`${card.title}-${i}-${reverse}`} card={card} index={i} />
      ))}
    </motion.div>
  )
}

export function InteractiveArcOrb() {
  return (
    <div className="relative h-[430px] sm:h-[520px] w-full overflow-hidden rounded-[2rem] border border-white/8 bg-[#0b0b0f]">
      {/* Cinematic background */}
      <div className="absolute inset-0 nb-grid-bg opacity-60" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(47,87,140,0.20)] blur-[90px]" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b0b0f] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b0b0f] to-transparent z-20 pointer-events-none" />

      {/* 3D stage */}
      <div className="absolute inset-0 flex items-center perspective-[1200px]">
        <motion.div
          className="w-full space-y-5 sm:space-y-6"
          style={{ transformStyle: 'preserve-3d', rotateX: 8, rotateY: -13, rotateZ: 0.5 }}
          animate={{ x: [-8, 12, -8], y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MovingRow duration={30} offset={0} />
          <div className="translate-x-[-150px] sm:translate-x-[-220px]">
            <MovingRow duration={36} offset={-160} />
          </div>
        </motion.div>
      </div>

      {/* Foreground label */}
      <div className="absolute left-5 bottom-5 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--arc-community-ink)]/80 px-3 py-2 backdrop-blur-xl">
        <Zap size={13} className="text-[#cfd8e6]" />
        <span className="text-[11px] text-white/55">Interactive Arc financial workspace</span>
      </div>

      <div className="absolute right-5 bottom-5 z-30 hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
        <CircleDollarSign size={13} className="text-[#cfd8e6]" />
        <span className="text-[11px] text-white/45">USDC native</span>
      </div>
    </div>
  )
}
