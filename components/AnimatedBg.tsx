'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export function AnimatedBg() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.05,
    }))
    setParticles(generated)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(29,78,216,0.04) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(29,78,216,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,78,216,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
