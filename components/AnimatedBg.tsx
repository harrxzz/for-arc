'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import * as THREE from 'three'

// Coin symbols to render as canvas textures
const COIN_SYMBOLS = ['$', '€', '₿', 'Ξ', '◎', '₮', 'Ξ', '$', '€', '◎', '₿', '₮']
const COIN_COLORS = [
  '#2775CA', // USDC blue
  '#26A17B', // USDT green
  '#F7931A', // BTC orange
  '#627EEA', // ETH purple
  '#9945FF', // SOL purple
  '#E84142', // AVAX red
  '#0033AD', // EURC blue
  '#2775CA',
  '#26A17B',
  '#627EEA',
  '#F7931A',
  '#9945FF',
]

function makeCoinTexture(symbol: string, color: string): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Coin base
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
  ctx.fillStyle = color + '33'
  ctx.fill()

  // Coin border
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
  ctx.strokeStyle = color + 'cc'
  ctx.lineWidth = 4
  ctx.stroke()

  // Inner ring
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2)
  ctx.strokeStyle = color + '55'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Symbol
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.38}px Inter, Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  ctx.fillText(symbol, size / 2, size / 2)

  return new THREE.CanvasTexture(canvas)
}

export function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300)
    camera.position.z = 22

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.2)
    dirLight.position.set(5, 8, 10)
    scene.add(dirLight)

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.6)
    rimLight.position.set(-8, -4, 5)
    scene.add(rimLight)

    // ── Globe ──
    const globeGeo = new THREE.SphereGeometry(5, 64, 64)

    // Wireframe overlay (continent lines effect)
    const wireGeo = new THREE.SphereGeometry(5.02, 32, 32)
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x6366f1 : 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    scene.add(wireMesh)

    // Globe outer shell — glassy
    const globeMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x1e1b4b : 0xc7d2fe,
      emissive: isDark ? 0x312e81 : 0xe0e7ff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: isDark ? 0.18 : 0.22,
      shininess: 120,
      specular: new THREE.Color(isDark ? 0x818cf8 : 0x6366f1),
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    // Globe inner glow
    const innerGeo = new THREE.SphereGeometry(4.6, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x4f46e5 : 0x818cf8,
      transparent: true,
      opacity: isDark ? 0.06 : 0.04,
    })
    scene.add(new THREE.Mesh(innerGeo, innerMat))

    // Globe equator ring
    const eqGeo = new THREE.TorusGeometry(5.1, 0.04, 8, 128)
    const eqMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x818cf8 : 0x6366f1,
      transparent: true,
      opacity: isDark ? 0.35 : 0.2,
    })
    const eqRing = new THREE.Mesh(eqGeo, eqMat)
    eqRing.rotation.x = Math.PI / 2
    scene.add(eqRing)

    // Orbit ring (tilted)
    const orbitGeo = new THREE.TorusGeometry(8.5, 0.03, 8, 128)
    const orbitMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x6366f1 : 0x818cf8,
      transparent: true,
      opacity: isDark ? 0.2 : 0.12,
    })
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat)
    orbitRing.rotation.x = Math.PI / 3
    orbitRing.rotation.z = Math.PI / 6
    scene.add(orbitRing)

    // ── Floating coins ──
    const coins: { group: THREE.Group; angle: number; speed: number; radius: number; tilt: number; selfSpin: number }[] = []
    const numCoins = 12

    for (let i = 0; i < numCoins; i++) {
      const angle = (i / numCoins) * Math.PI * 2
      const radius = 8.5 + (Math.random() - 0.5) * 1.5
      const tilt = (Math.random() - 0.5) * 0.8

      const group = new THREE.Group()

      // Coin disc
      const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32)
      const tex = makeCoinTexture(COIN_SYMBOLS[i % COIN_SYMBOLS.length], COIN_COLORS[i % COIN_COLORS.length])
      const coinMat = new THREE.MeshPhongMaterial({
        map: tex,
        transparent: true,
        opacity: isDark ? 0.85 : 0.75,
        shininess: 80,
        specular: new THREE.Color(0xffffff),
      })
      const coinMesh = new THREE.Mesh(coinGeo, coinMat)
      coinMesh.rotation.x = Math.PI / 2
      group.add(coinMesh)

      // Coin glow ring
      const glowGeo = new THREE.TorusGeometry(0.6, 0.04, 8, 32)
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(COIN_COLORS[i % COIN_COLORS.length]),
        transparent: true,
        opacity: 0.4,
      })
      const glowRing = new THREE.Mesh(glowGeo, glowMat)
      glowRing.rotation.x = Math.PI / 2
      group.add(glowRing)

      // Position on orbit
      group.position.x = Math.cos(angle) * radius
      group.position.y = Math.sin(angle) * radius * 0.35 + tilt * 2
      group.position.z = Math.sin(angle) * radius * 0.2

      scene.add(group)
      coins.push({
        group,
        angle,
        speed: 0.003 + Math.random() * 0.002,
        radius,
        tilt,
        selfSpin: (Math.random() - 0.5) * 0.02,
      })
    }

    // ── Background nebula orbs ──
    const orbColors = isDark
      ? [0x4f46e5, 0x7c3aed, 0x1e40af, 0x6d28d9]
      : [0xc7d2fe, 0xddd6fe, 0xbfdbfe, 0xe0e7ff]

    orbColors.forEach((color, i) => {
      const geo = new THREE.SphereGeometry(12 + i * 4, 16, 16)
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isDark ? 0.04 : 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        [-25, 25, -15, 20][i],
        [12, -10, -18, 8][i],
        [-40, -45, -50, -55][i]
      )
      scene.add(mesh)
    })

    // ── Star particles ──
    const starGeo = new THREE.BufferGeometry()
    const starCount = 400
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 250
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({
      color: isDark ? 0xc4b5fd : 0x6366f1,
      size: isDark ? 0.1 : 0.07,
      transparent: true,
      opacity: isDark ? 0.45 : 0.2,
    })
    scene.add(new THREE.Points(starGeo, starMat))

    // ── Mouse parallax ──
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ──
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Animate ──
    let frame = 0
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      frame++

      // Camera parallax
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.025
      camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.025
      camera.lookAt(0, 0, 0)

      // Globe slow rotation
      globe.rotation.y += 0.0025
      wireMesh.rotation.y += 0.002
      eqRing.rotation.z += 0.001
      orbitRing.rotation.z += 0.0008

      // Coins orbit
      coins.forEach((c) => {
        c.angle += c.speed
        const orbitTilt = Math.PI / 5
        const x = Math.cos(c.angle) * c.radius
        const y = Math.sin(c.angle) * c.radius * Math.sin(orbitTilt) + c.tilt
        const z = Math.sin(c.angle) * c.radius * Math.cos(orbitTilt) * 0.3

        c.group.position.set(x, y, z)

        // Face camera + self spin
        c.group.rotation.y += c.selfSpin
        c.group.rotation.x = Math.sin(frame * 0.01 + c.angle) * 0.3

        // Pulse glow
        const glowRing = c.group.children[1] as THREE.Mesh
        const glowMat = glowRing.material as THREE.MeshBasicMaterial
        glowMat.opacity = 0.25 + Math.sin(frame * 0.05 + c.angle * 3) * 0.15
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
