'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowLeftRight, Bot, Globe, Send, Wallet, Zap } from 'lucide-react'

const actions = [
  { Icon: ArrowLeftRight, label: 'Swap', x: -92, y: -58 },
  { Icon: Globe, label: 'Bridge', x: 88, y: -46 },
  { Icon: Send, label: 'Send', x: -82, y: 66 },
  { Icon: Bot, label: 'Agent', x: 92, y: 72 },
]

export function InteractiveArcOrb() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.4 })
  const rotateX = useTransform(sy, [-1, 1], [12, -12])
  const rotateY = useTransform(sx, [-1, 1], [-16, 16])
  const translateX = useTransform(sx, [-1, 1], [-28, 28])
  const translateY = useTransform(sy, [-1, 1], [-18, 18])

  return (
    <div
      ref={ref}
      className="relative h-[360px] sm:h-[430px] w-full max-w-[520px] mx-auto perspective-[1200px] select-none"
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
        my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      aria-label="Interactive 3D Arc Network visualization"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ x: [-18, 18, -18], y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          style={{ rotateX, rotateY, x: translateX, y: translateY, transformStyle: 'preserve-3d' }}
          className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]"
        >
          {/* back glow */}
          <motion.div
            className="absolute inset-8 rounded-full bg-indigo-500/20 blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'translateZ(-60px)' }}
          />

          {/* orbit rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-white/10"
              style={{
                transform: `translateZ(${-20 + i * 18}px) rotateX(${62 + i * 12}deg) rotateY(${18 - i * 10}deg)`,
              }}
              animate={{ rotateZ: i % 2 ? 360 : -360 }}
              transition={{ duration: 16 + i * 4, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* main card / orb */}
          <motion.div
            className="absolute inset-[52px] rounded-[2rem] nb-card-elevated overflow-hidden"
            style={{ transform: 'translateZ(70px)' }}
            animate={{ rotateZ: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(99,102,241,.26),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(165,168,240,.11),transparent_38%)]" />
            <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Wallet size={18} className="text-indigo-300" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-[10px] text-white/50">Live</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Arc Balance</div>
                <div className="font-display text-3xl sm:text-4xl text-white" style={{ fontWeight: 600 }}>$0.00</div>
                <div className="text-xs text-white/35 mt-1">USDC as gas</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['USDC', 'EURC', 'ARC'].map((t) => (
                  <div key={t} className="rounded-xl bg-white/5 border border-white/8 px-2 py-2 text-center">
                    <div className="text-[10px] text-white/45">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* center coin */}
          <motion.div
            className="absolute left-1/2 top-1/2 w-20 h-20 -ml-10 -mt-10 rounded-full bg-[#09090b] border border-indigo-400/30 flex items-center justify-center"
            style={{ transform: 'translateZ(120px)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={24} className="text-indigo-300" />
          </motion.div>

          {/* floating action chips */}
          {actions.map(({ Icon, label, x, y }, i) => (
            <motion.div
              key={label}
              className="absolute left-1/2 top-1/2 -ml-12 -mt-5 w-24 rounded-full bg-[#18181b]/90 backdrop-blur-xl border border-white/10 px-3 py-2 flex items-center gap-2"
              style={{ transform: `translate3d(${x}px, ${y}px, ${110 + i * 8}px)` }}
              animate={{ y: [y, y - 8, y], x: [x, x + (i % 2 ? 8 : -8), x] }}
              transition={{ duration: 3.6 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon size={13} className="text-indigo-300" />
              <span className="text-[11px] text-white/70 font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute left-1/2 bottom-7 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent" />
    </div>
  )
}
