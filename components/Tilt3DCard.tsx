'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Tilt3DCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number // tilt degree, default 12
}

export function Tilt3DCard({ children, className = '', intensity = 12 }: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width   // 0–1
    const y = (e.clientY - rect.top) / rect.height    // 0–1
    const rotateX = (0.5 - y) * intensity * 2         // tilt up/down
    const rotateY = (x - 0.5) * intensity * 2         // tilt left/right
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`)
    setGlare({ x: x * 100, y: y * 100, opacity: 0.12 })
  }

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)')
    setGlare(g => ({ ...g, opacity: 0 }))
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform === '' ? 'none' : 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {children}
      {/* Glare overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
        }}
      />
    </div>
  )
}
