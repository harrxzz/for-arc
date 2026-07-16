'use client'

import { useEffect, useRef } from 'react'

export function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const draw = () => {
      frame += 1
      // Keep the texture alive without burning the CPU every frame.
      if (frame % 3 === 0) {
        const { width, height } = canvas
        const imageData = ctx.createImageData(width, height)
        const buffer = new Uint32Array(imageData.data.buffer)
        for (let i = 0; i < buffer.length; i += 1) {
          const value = (Math.random() * 255) | 0
          buffer[i] = (255 << 24) | (value << 16) | (value << 8) | value
        }
        ctx.putImageData(imageData, 0, 0)
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} id="grain" aria-hidden="true" />
}
