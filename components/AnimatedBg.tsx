'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export function AnimatedBg() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!mountRef.current) return

    let animId: number
    const mount = mountRef.current

    // Dynamic import Three.js
    const init = async () => {
      const THREE = await import('three')

      // Scene
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Colors
      const blueColors = isDark
        ? [0x3b82f6, 0x6366f1, 0x60a5fa, 0x818cf8, 0x93c5fd]
        : [0x1d4ed8, 0x3b82f6, 0x6366f1, 0x2563eb, 0x4f46e5]

      const objects: import('three').Mesh[] = []

      // Create floating crystal/geometric shapes
      const geometries = [
        new THREE.OctahedronGeometry(0.3, 0),
        new THREE.IcosahedronGeometry(0.25, 0),
        new THREE.TetrahedronGeometry(0.3, 0),
        new THREE.OctahedronGeometry(0.2, 0),
        new THREE.IcosahedronGeometry(0.35, 0),
      ]

      for (let i = 0; i < 30; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)]
        const color = blueColors[Math.floor(Math.random() * blueColors.length)]

        // Wireframe + solid combo
        const isWireframe = Math.random() > 0.5

        const mat = new THREE.MeshStandardMaterial({
          color,
          wireframe: isWireframe,
          transparent: true,
          opacity: isDark ? (isWireframe ? 0.3 : 0.15) : (isWireframe ? 0.2 : 0.08),
          emissive: new THREE.Color(color),
          emissiveIntensity: isDark ? 0.3 : 0.1,
        })

        const mesh = new THREE.Mesh(geo, mat)

        // Random position spread across screen
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6 - 2
        )

        // Random rotation
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )

        // Store velocity for animation
        ;(mesh as any).vx = (Math.random() - 0.5) * 0.003
        ;(mesh as any).vy = (Math.random() - 0.5) * 0.003 - 0.001
        ;(mesh as any).rx = (Math.random() - 0.5) * 0.008
        ;(mesh as any).ry = (Math.random() - 0.5) * 0.008
        ;(mesh as any).rz = (Math.random() - 0.5) * 0.005

        scene.add(mesh)
        objects.push(mesh)
      }

      // Add floating particles
      const particleGeo = new THREE.BufferGeometry()
      const particleCount = 200
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount * 3; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMat = new THREE.PointsMaterial({
        color: isDark ? 0x93c5fd : 0x3b82f6,
        size: 0.03,
        transparent: true,
        opacity: isDark ? 0.6 : 0.3,
      })
      const particles = new THREE.Points(particleGeo, particleMat)
      scene.add(particles)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const pointLight1 = new THREE.PointLight(0x3b82f6, isDark ? 2 : 1, 20)
      pointLight1.position.set(5, 5, 5)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0x6366f1, isDark ? 1.5 : 0.8, 20)
      pointLight2.position.set(-5, -5, 3)
      scene.add(pointLight2)

      // Mouse parallax
      let mouseX = 0
      let mouseY = 0
      const handleMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5
      }
      window.addEventListener('mousemove', handleMouse)

      // Resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', handleResize)

      // Animate
      const animate = () => {
        animId = requestAnimationFrame(animate)

        // Camera parallax
        camera.position.x += (mouseX - camera.position.x) * 0.02
        camera.position.y += (-mouseY - camera.position.y) * 0.02
        camera.lookAt(scene.position)

        // Rotate + float objects
        objects.forEach((obj) => {
          obj.rotation.x += (obj as any).rx
          obj.rotation.y += (obj as any).ry
          obj.rotation.z += (obj as any).rz
          obj.position.x += (obj as any).vx
          obj.position.y += (obj as any).vy

          // Wrap around screen
          if (obj.position.y < -6) obj.position.y = 6
          if (obj.position.y > 6) obj.position.y = -6
          if (obj.position.x < -8) obj.position.x = 8
          if (obj.position.x > 8) obj.position.x = -8
        })

        // Slowly rotate particles
        particles.rotation.y += 0.0003
        particles.rotation.x += 0.0001

        renderer.render(scene, camera)
      }

      animate()

      // Cleanup
      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', handleMouse)
        window.removeEventListener('resize', handleResize)
        mount.removeChild(renderer.domElement)
        renderer.dispose()
        geometries.forEach(g => g.dispose())
        objects.forEach(o => (o.material as import('three').Material).dispose())
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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: isDark ? 'linear-gradient(135deg, #050510 0%, #0a0a1f 50%, #080818 100%)' : 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #eff6ff 100%)' }}
    />
  )
}
