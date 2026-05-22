'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import * as THREE from 'three'

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
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.z = 40

    // ── Nebula orbs (large blurred spheres) ──
    const orbs: THREE.Mesh[] = []
    const orbData = isDark
      ? [
          { color: 0x6366f1, x: -20, y: 10, z: -30, r: 18 },
          { color: 0x7c3aed, x: 20, y: -8, z: -35, r: 22 },
          { color: 0x4f46e5, x: 0, y: -15, z: -40, r: 25 },
          { color: 0x0ea5e9, x: 30, y: 15, z: -45, r: 15 },
        ]
      : [
          { color: 0xc7d2fe, x: -20, y: 10, z: -30, r: 18 },
          { color: 0xddd6fe, x: 20, y: -8, z: -35, r: 22 },
          { color: 0xe0e7ff, x: 0, y: -15, z: -40, r: 25 },
          { color: 0xbae6fd, x: 30, y: 15, z: -45, r: 15 },
        ]

    orbData.forEach(({ color, x, y, z, r }) => {
      const geo = new THREE.SphereGeometry(r, 32, 32)
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isDark ? 0.07 : 0.18,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      scene.add(mesh)
      orbs.push(mesh)
    })

    // ── Floating crystals ──
    const crystals: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; rx: number; ry: number }[] = []
    const crystalColors = isDark
      ? [0x6366f1, 0x8b5cf6, 0x4f46e5, 0xa78bfa, 0x0ea5e9, 0x7c3aed]
      : [0x6366f1, 0x8b5cf6, 0x4f46e5, 0xa78bfa, 0x93c5fd, 0xc4b5fd]

    for (let i = 0; i < 55; i++) {
      const geo = Math.random() > 0.5
        ? new THREE.OctahedronGeometry(Math.random() * 0.6 + 0.2)
        : new THREE.TetrahedronGeometry(Math.random() * 0.5 + 0.2)
      const color = crystalColors[Math.floor(Math.random() * crystalColors.length)]
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isDark ? Math.random() * 0.35 + 0.1 : Math.random() * 0.2 + 0.05,
        wireframe: Math.random() > 0.6,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40 - 10
      )
      scene.add(mesh)
      crystals.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.008,
        vy: (Math.random() - 0.5) * 0.006,
        vz: (Math.random() - 0.5) * 0.004,
        rx: (Math.random() - 0.5) * 0.012,
        ry: (Math.random() - 0.5) * 0.012,
      })
    }

    // ── USDC coin rings ──
    const rings: { mesh: THREE.Mesh; speed: number; phase: number }[] = []
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.TorusGeometry(Math.random() * 2 + 1, 0.06, 8, 48)
      const mat = new THREE.MeshBasicMaterial({
        color: isDark ? 0x6366f1 : 0x818cf8,
        transparent: true,
        opacity: isDark ? 0.18 : 0.12,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20 - 5
      )
      mesh.rotation.x = Math.random() * Math.PI
      mesh.rotation.y = Math.random() * Math.PI
      scene.add(mesh)
      rings.push({ mesh, speed: Math.random() * 0.008 + 0.003, phase: Math.random() * Math.PI * 2 })
    }

    // ── Star particles ──
    const starGeo = new THREE.BufferGeometry()
    const starCount = 300
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 200
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({
      color: isDark ? 0xc4b5fd : 0x6366f1,
      size: isDark ? 0.12 : 0.08,
      transparent: true,
      opacity: isDark ? 0.5 : 0.25,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

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
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.03
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.03

      // Crystals
      crystals.forEach(({ mesh, vx, vy, vz, rx, ry }) => {
        mesh.position.x += vx
        mesh.position.y += vy
        mesh.position.z += vz
        mesh.rotation.x += rx
        mesh.rotation.y += ry
        if (Math.abs(mesh.position.x) > 42) mesh.position.x *= -0.98
        if (Math.abs(mesh.position.y) > 32) mesh.position.y *= -0.98
        if (mesh.position.z > 10 || mesh.position.z < -30) mesh.position.z *= -0.98
      })

      // Rings
      rings.forEach(({ mesh, speed, phase }) => {
        mesh.rotation.x += speed
        mesh.rotation.z += speed * 0.7
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.opacity = (isDark ? 0.12 : 0.08) + Math.sin(frame * 0.02 + phase) * 0.06
      })

      // Orbs slow drift
      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(frame * 0.005 + i) * 0.02
        orb.position.x += Math.cos(frame * 0.004 + i) * 0.015
      })

      // Stars slow rotation
      stars.rotation.y += 0.0002
      stars.rotation.x += 0.0001

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
