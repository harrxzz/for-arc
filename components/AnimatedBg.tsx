'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import * as THREE from 'three'

// Coin symbols to render as canvas textures
const COIN_SYMBOLS = ['$', '€', '₿', 'Ξ', '◎', '₮', 'Ξ', '$', '€', '◎', '₿', '₮']
const COIN_COLORS = [
  '#ffffff', // white
  '#cccccc', // light grey
  '#aaaaaa', // mid grey
  '#888888', // grey
  '#666666', // dark grey
  '#dddddd', // silver
  '#ffffff',
  '#cccccc',
  '#aaaaaa',
  '#888888',
  '#dddddd',
  '#666666',
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

    // Deep space background
    scene.background = new THREE.Color(isDark ? 0x000000 : 0x080808)

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300)
    camera.position.z = 22

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 8, 10)
    scene.add(dirLight)

    const rimLight = new THREE.DirectionalLight(0xcccccc, 0.6)
    rimLight.position.set(-8, -4, 5)
    scene.add(rimLight)

    // ── Globe ──
    const globeGeo = new THREE.SphereGeometry(5, 64, 64)

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(5.02, 32, 32)
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0xaaaaaa,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    scene.add(wireMesh)

    // Globe outer shell — monochrome glassy
    const globeMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x111111 : 0x222222,
      emissive: isDark ? 0x222222 : 0x333333,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: isDark ? 0.22 : 0.28,
      shininess: 140,
      specular: new THREE.Color(isDark ? 0xffffff : 0xcccccc),
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    // Globe inner glow — white
    const innerGeo = new THREE.SphereGeometry(4.6, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0xaaaaaa,
      transparent: true,
      opacity: isDark ? 0.06 : 0.04,
    })
    scene.add(new THREE.Mesh(innerGeo, innerMat))

    // Globe equator ring — white
    const eqGeo = new THREE.TorusGeometry(5.1, 0.04, 8, 128)
    const eqMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0xaaaaaa,
      transparent: true,
      opacity: isDark ? 0.35 : 0.2,
    })
    const eqRing = new THREE.Mesh(eqGeo, eqMat)
    eqRing.rotation.x = Math.PI / 2
    scene.add(eqRing)

    // Orbit ring (tilted) — grey
    const orbitGeo = new THREE.TorusGeometry(8.5, 0.03, 8, 128)
    const orbitMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xcccccc : 0x888888,
      transparent: true,
      opacity: isDark ? 0.22 : 0.12,
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

    // ── Ambient colored orbs ──
    const orbDefs = [
      { color: 0x111111, size: 12, x: -25, y: 12, z: -40, dark: 0x111111, light: 0x1a1a1a },
      { color: 0x9F72FF, size: 14, x: 28, y: -8, z: -45, dark: 0x9F72FF, light: 0x9F72FF },
      { color: 0x0d0d0d, size: 18, x: -15, y: -18, z: -50, dark: 0x0d0d0d, light: 0x111111 },
      { color: 0xACC6E9, size: 16, x: 22, y: 10, z: -55, dark: 0xACC6E9, light: 0xACC6E9 },
    ]

    orbDefs.forEach(({ size, x, y, z, dark, light }, i) => {
      const geo = new THREE.SphereGeometry(size, 16, 16)
      const mat = new THREE.MeshBasicMaterial({
        color: isDark ? dark : light,
        transparent: true,
        opacity: i === 1 ? 0.06 : i === 3 ? 0.05 : 0.18,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      scene.add(mesh)
    })

    // ── Star particles — multi-color space stars ──
    const starGeo = new THREE.BufferGeometry()
    const starCount = 700
    const starPos = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 280
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 280
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 280

      // Star color variety: white, grey-white, silver, arc
      const r = Math.random()
      if (r < 0.5) {
        // pure white
        starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1
      } else if (r < 0.75) {
        // grey-white
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 0.8
      } else if (r < 0.9) {
        // arc tint
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.6; starColors[i * 3 + 2] = 1.0
      } else {
        // light-blue tint
        starColors[i * 3] = 0.6; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: isDark ? 0.14 : 0.10,
      transparent: true,
      opacity: isDark ? 0.75 : 0.55,
      vertexColors: true,
      sizeAttenuation: true,
    })
    const starField = new THREE.Points(starGeo, starMat)
    scene.add(starField)

    // ── Shooting stars ──
    type ShootingStar = {
      line: THREE.Line
      active: boolean
      progress: number
      speed: number
      startPos: THREE.Vector3
      endPos: THREE.Vector3
      cooldown: number
    }

    function makeShootingStar(): ShootingStar {
      const startX = (Math.random() - 0.5) * 60
      const startY = 12 + Math.random() * 10
      const startZ = -10 - Math.random() * 20
      const length = 6 + Math.random() * 10
      const angle = -Math.PI / 6 + (Math.random() - 0.5) * 0.3

      const startPos = new THREE.Vector3(startX, startY, startZ)
      const endPos = new THREE.Vector3(
        startX + Math.cos(angle) * length,
        startY + Math.sin(angle) * length,
        startZ
      )
      const pts = [startPos.clone(), startPos.clone()]
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
      const line = new THREE.Line(geo, mat)
      scene.add(line)
      return { line, active: false, progress: 0, speed: 0.022 + Math.random() * 0.018, startPos, endPos, cooldown: 100 + Math.random() * 350 }
    }

    const shootingStars: ShootingStar[] = Array.from({ length: 4 }, makeShootingStar)

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

      // Star field slow drift
      starField.rotation.y += 0.0002
      starField.rotation.x += 0.00005

      // Star twinkle
      starMat.opacity = (isDark ? 0.75 : 0.55) * (0.88 + Math.sin(frame * 0.03) * 0.12)

      // Coins orbit
      coins.forEach((c) => {
        c.angle += c.speed
        const orbitTilt = Math.PI / 5
        const x = Math.cos(c.angle) * c.radius
        const y = Math.sin(c.angle) * c.radius * Math.sin(orbitTilt) + c.tilt
        const z = Math.sin(c.angle) * c.radius * Math.cos(orbitTilt) * 0.3

        c.group.position.set(x, y, z)
        c.group.rotation.y += c.selfSpin
        c.group.rotation.x = Math.sin(frame * 0.01 + c.angle) * 0.3

        // Pulse glow
        const glowRing = c.group.children[1] as THREE.Mesh
        const glowMat = glowRing.material as THREE.MeshBasicMaterial
        glowMat.opacity = 0.25 + Math.sin(frame * 0.05 + c.angle * 3) * 0.15
      })

      // Shooting stars
      shootingStars.forEach((ss) => {
        if (!ss.active) {
          ss.cooldown--
          if (ss.cooldown <= 0) { ss.active = true; ss.progress = 0 }
          return
        }
        ss.progress += ss.speed
        const mat = ss.line.material as THREE.LineBasicMaterial

        if (ss.progress >= 1) {
          ss.active = false
          ss.cooldown = 150 + Math.random() * 400
          mat.opacity = 0
          const startX = (Math.random() - 0.5) * 60
          const startY = 12 + Math.random() * 10
          const startZ = -10 - Math.random() * 20
          const length = 6 + Math.random() * 10
          const angle = -Math.PI / 6 + (Math.random() - 0.5) * 0.3
          ss.startPos.set(startX, startY, startZ)
          ss.endPos.set(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length, startZ)
          ss.speed = 0.022 + Math.random() * 0.018
          return
        }

        const headT = Math.min(ss.progress * 1.5, 1)
        const tailT = Math.max(ss.progress * 1.5 - 0.5, 0)
        const head = ss.startPos.clone().lerp(ss.endPos, headT)
        const tail = ss.startPos.clone().lerp(ss.endPos, tailT)
        const geo = ss.line.geometry as THREE.BufferGeometry
        geo.setFromPoints([tail, head])
        geo.computeBoundingSphere()

        const fade = ss.progress < 0.2
          ? ss.progress / 0.2
          : ss.progress > 0.7
            ? (1 - ss.progress) / 0.3
            : 1
        mat.opacity = fade * 0.9
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
