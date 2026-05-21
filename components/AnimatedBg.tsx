'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  opacitySpeed: number
  color: string
  type: 'crystal' | 'mist' | 'spark'
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
}

export function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS_DARK = [
      'rgba(59,130,246,',   // blue-500
      'rgba(96,165,250,',   // blue-400
      'rgba(147,197,253,',  // blue-300
      'rgba(186,230,253,',  // sky-200
      'rgba(224,242,254,',  // sky-100
      'rgba(99,102,241,',   // indigo-500
    ]
    const COLORS_LIGHT = [
      'rgba(29,78,216,',    // blue-700
      'rgba(59,130,246,',   // blue-500
      'rgba(96,165,250,',   // blue-400
      'rgba(147,197,253,',  // blue-300
      'rgba(99,102,241,',   // indigo-500
    ]

    const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT

    const spawnParticle = (): Particle => {
      const type = Math.random() < 0.5 ? 'mist' : Math.random() < 0.7 ? 'crystal' : 'spark'
      const maxLife = type === 'mist' ? 200 + Math.random() * 200 : 100 + Math.random() * 150
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.3 + Math.random() * 0.8),
        size: type === 'mist' ? 40 + Math.random() * 80 : type === 'crystal' ? 3 + Math.random() * 8 : 1 + Math.random() * 3,
        opacity: 0,
        opacitySpeed: 0.005 + Math.random() * 0.01,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        life: 0,
        maxLife,
      }
    }

    // Init particles
    for (let i = 0; i < 60; i++) {
      const p = spawnParticle()
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      p.opacity = isDark ? 0.05 + Math.random() * 0.15 : 0.03 + Math.random() * 0.08
      particles.push(p)
    }

    const drawCrystal = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity

      // Diamond/crystal shape
      const s = p.size
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.6, 0)
      ctx.lineTo(0, s)
      ctx.lineTo(-s * 0.6, 0)
      ctx.closePath()

      const grad = ctx.createLinearGradient(-s, -s, s, s)
      grad.addColorStop(0, `${p.color}${p.opacity * 1.5})`)
      grad.addColorStop(0.5, `${p.color}${p.opacity * 0.8})`)
      grad.addColorStop(1, `${p.color}${p.opacity * 0.3})`)
      ctx.fillStyle = grad
      ctx.fill()

      // Crystal edge highlight
      ctx.strokeStyle = `${p.color}${Math.min(p.opacity * 2, 0.6)})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.restore()
    }

    const drawMist = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save()
      ctx.globalAlpha = p.opacity * 0.4

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
      grad.addColorStop(0, `${p.color}${p.opacity})`)
      grad.addColorStop(0.4, `${p.color}${p.opacity * 0.5})`)
      grad.addColorStop(1, `${p.color}0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.rotation, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawSpark = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity

      // Star/spark shape
      const s = p.size
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2
        const outerX = Math.cos(angle) * s
        const outerY = Math.sin(angle) * s
        const innerX = Math.cos(angle + Math.PI / 4) * s * 0.3
        const innerY = Math.sin(angle + Math.PI / 4) * s * 0.3
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        ctx.lineTo(innerX, innerY)
      }
      ctx.closePath()
      ctx.fillStyle = `${p.color}${p.opacity})`
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient
      if (isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        bgGrad.addColorStop(0, '#050510')
        bgGrad.addColorStop(0.5, '#0a0a1a')
        bgGrad.addColorStop(1, '#080818')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Update + draw particles
      particles = particles.filter(p => p.life < p.maxLife)

      while (particles.length < 60) {
        particles.push(spawnParticle())
      }

      for (const p of particles) {
        p.life++
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.3
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Fade in/out
        const lifeRatio = p.life / p.maxLife
        if (lifeRatio < 0.2) {
          p.opacity = Math.min(p.opacity + p.opacitySpeed, isDark ? 0.18 : 0.08)
        } else if (lifeRatio > 0.7) {
          p.opacity = Math.max(p.opacity - p.opacitySpeed * 0.5, 0)
        }

        if (p.type === 'mist') drawMist(ctx, p)
        else if (p.type === 'crystal') drawCrystal(ctx, p)
        else drawSpark(ctx, p)
      }

      // Subtle grid overlay
      ctx.save()
      ctx.globalAlpha = isDark ? 0.04 : 0.025
      ctx.strokeStyle = isDark ? '#3b82f6' : '#1d4ed8'
      ctx.lineWidth = 0.5
      const gridSize = 60
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      ctx.restore()

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: isDark ? 1 : 0.6 }}
    />
  )
}
