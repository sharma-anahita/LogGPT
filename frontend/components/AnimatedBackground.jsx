'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Responsive particle count
    const count = window.innerWidth > 1024 ? 36 : window.innerWidth > 640 ? 24 : 14
    const newParticles = [...Array(count)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      size: 0.5 + Math.random() * 1.5,
      blur: 2 + Math.random() * 6,
      opacity: 0.25 + Math.random() * 0.4,
    }))
    setParticles(newParticles)

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Grid Background */}
      <div className="fixed inset-0 grid-background opacity-20 pointer-events-none z-0" />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cyan glow - top left */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.05,
            y: mousePosition.y * 0.05,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0) 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Violet glow - bottom right */}
        <motion.div
          animate={{
            x: mousePosition.x * -0.03,
            y: mousePosition.y * -0.03,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0) 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Cyan glow - center top */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0) 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {isClient && particles.map((particle, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30 * particle.size, 0],
              x: [0, Math.sin(i) * 10 * particle.size, 0],
              opacity: [0, particle.opacity, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size * 6}px`,
              height: `${particle.size * 6}px`,
              background: 'radial-gradient(circle, rgba(0,240,255,0.7) 0%, rgba(0,240,255,0.1) 80%)',
              filter: `blur(${particle.blur}px)`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>
    </>
  )
}
