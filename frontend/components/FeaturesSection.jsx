'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: '⚡',
    title: 'Real-time Analysis',
    description: 'Instantly process and analyze logs as they arrive. Get insights within milliseconds of events occurring.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Detection',
    description: 'Machine learning models detect anomalies that humans would miss. Learn from your infrastructure patterns.',
  },
  {
    icon: '🔍',
    title: 'Intelligent Search',
    description: 'Natural language queries find exactly what you need. No complex syntax required.',
  },
  {
    icon: '📊',
    title: 'Visual Intelligence',
    description: 'Beautiful dashboards that tell the story of your infrastructure health at a glance.',
  },
  {
    icon: '🎯',
    title: 'Predictive Insights',
    description: 'AI predicts potential issues before they become critical problems.',
  },
  {
    icon: '🚀',
    title: 'Built for Scale',
    description: 'Handle millions of logs per minute without breaking a sweat.',
  },
]

export function FeaturesSection() {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('features-section')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="features-section" className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">Powerful Features</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Everything you need to gain complete visibility into your infrastructure
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: '0 20px 40px rgba(0, 240, 255, 0.1)',
              }}
              className="group glass p-8 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent */}
              <div className="mt-4 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Background elements */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.05) 0%, transparent 70%)',
          }}
        />
      </div>
    </section>
  )
}
