'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export function AnimatedBg() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!mountRef.current) return

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let animId: number
    const mount = mountRef.current

    const init = async () => {
      const THREE = await import('three')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Colors — more vibrant in dark mode
      const blueColors = isDark
        ? [0x3b82f6, 0x6366f1, 0x60a5fa, 0x818cf8, 0x93c5fd, 0xa78bfa, 0x38bdf8]
        : [0x1d4ed8, 0x3b82f6, 0x6366f1, 0x2563eb, 0x4f46e5]

      const objects: import('three').Mesh[] = []

      // More geometries for variety
      const geometries = [
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.IcosahedronGeometry(0.3, 0),
        new THREE.TetrahedronGeometry(0.35, 0),
        new THREE.OctahedronGeometry(0.2, 0),
        new THREE.IcosahedronGeometry(0.45, 0),
        new THREE.DodecahedronGeometry(0.3, 0),
        new THREE.OctahedronGeometry(0.5, 0),
      ]

      // More crystals — 50 instead of 30
      for (let i = 0; i < 50; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)]
        const color = blueColors[Math.floor(Math.random() * blueColors.length)]
        const isWireframe = Math.random() > 0.4

        const mat = new THREE.MeshStandardMaterial({
          color,
          wireframe: isWireframe,
          transparent: true,
          opacity: isDark
            ? (isWireframe ? 0.35 : 0.18)
            : (isWireframe ? 0.2 : 0.1),
          emissive: new THREE.Color(color),
          emissiveIntensity: isDark ? 0.5 : 0.15,
        })

        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8 - 2
        )
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )
        ;(mesh as any).vx = (Math.random() - 0.5) * 0.004
        ;(mesh as any).vy = (Math.random() - 0.5) * 0.004 - 0.001
        ;(mesh as any).rx = (Math.random() - 0.5) * 0.01
        ;(mesh as any).ry = (Math.random() - 0.5) * 0.01
        ;(mesh as any).rz = (Math.random() - 0.5) * 0.006

        scene.add(mesh)
        objects.push(mesh)
      }

      // Floating particles — more dense
      const particleGeo = new THREE.BufferGeometry()
      const particleCount = 350
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 24
        positions[i * 3 + 1] = (Math.random() - 0.5) * 18
        positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMat = new THREE.PointsMaterial({
        color: isDark ? 0x93c5fd : 0x3b82f6,
        size: isDark ? 0.04 : 0.025,
        transparent: true,
        opacity: isDark ? 0.7 : 0.35,
      })
      const particles = new THREE.Points(particleGeo, particleMat)
      scene.add(particles)

      // Glow rings — large torus shapes for depth
      if (isDark) {
        const ringColors = [0x3b82f6, 0x6366f1, 0xa78bfa]
        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.TorusGeometry(2 + i * 1.5, 0.02, 8, 60)
          const ringMat = new THREE.MeshBasicMaterial({
            color: ringColors[i],
            transparent: true,
            opacity: 0.08 - i * 0.02,
          })
          const ring = new THREE.Mesh(ringGeo, ringMat)
          ring.rotation.x = Math.PI / 3 + i * 0.3
          ring.rotation.y = i * 0.5
          ring.position.z = -3 - i
          ;(ring as any).ry = 0.002 + i * 0.001
          ;(ring as any).rx = 0.001
          scene.add(ring)
          objects.push(ring)
        }
      }

      // Lighting — stronger for more dramatic look
      const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.4 : 0.6)
      scene.add(ambientLight)

      const pointLight1 = new THREE.PointLight(0x3b82f6, isDark ? 3 : 1.5, 25)
      pointLight1.position.set(5, 5, 5)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0x6366f1, isDark ? 2 : 1, 25)
      pointLight2.position.set(-5, -5, 3)
      scene.add(pointLight2)

      const pointLight3 = new THREE.PointLight(0xa78bfa, isDark ? 1.5 : 0.5, 20)
      pointLight3.position.set(0, 8, -2)
      scene.add(pointLight3)

      // Mouse parallax
      let mouseX = 0
      let mouseY = 0
      const handleMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.8
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.8
      }
      window.addEventListener('mousemove', handleMouse)

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', handleResize)

      const animate = () => {
        animId = requestAnimationFrame(animate)

        // Smooth camera parallax
        camera.position.x += (mouseX - camera.position.x) * 0.025
        camera.position.y += (-mouseY - camera.position.y) * 0.025
        camera.lookAt(scene.position)

        objects.forEach((obj) => {
          obj.rotation.x += (obj as any).rx ?? 0
          obj.rotation.y += (obj as any).ry ?? 0
          obj.rotation.z += (obj as any).rz ?? 0
          obj.position.x += (obj as any).vx ?? 0
          obj.position.y += (obj as any).vy ?? 0

          if (obj.position.y < -7) obj.position.y = 7
          if (obj.position.y > 7) obj.position.y = -7
          if (obj.position.x < -10) obj.position.x = 10
          if (obj.position.x > 10) obj.position.x = -10
        })

        particles.rotation.y += 0.0004
        particles.rotation.x += 0.0001

        renderer.render(scene, camera)
      }

      animate()

      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', handleMouse)
        window.removeEventListener('resize', handleResize)
        mount.removeChild(renderer.domElement)
        renderer.dispose()
        geometries.forEach(g => g.dispose())
        objects.forEach(o => {
          const mat = (o as any).material
          if (mat && typeof mat.dispose === 'function') mat.dispose()
        })
        particleGeo.dispose()
        particleMat.dispose()
      }
    }

    let cleanup: (() => void) | undefined
    init().then(fn => { cleanup = fn })

    return () => {
      cleanup?.()
      cancelAnimationFrame(animId)
    }
  }, [isDark])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #020208 0%, #050510 40%, #080818 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #eff6ff 100%)',
      }}
    />
  )
}
