'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { AIDemoSection } from '@/components/AIDemoSection'
import { CTASection } from '@/components/CTASection'
import Workspace from '@/components/Workspace'

export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleCtaClick = () => {
    setIsTransitioning(true)
    // Let the page scroll up before showing workspace
    setTimeout(() => {
      setShowWorkspace(true)
    }, 800)
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!showWorkspace ? (
          <motion.div
            key="landing"
            exit={{
              opacity: 0,
              filter: 'blur(10px)',
            }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-black"
          >
            <AnimatedBackground />

            {/* Main content */}
            <div className="relative z-10">
              <HeroSection onCtaClick={handleCtaClick} />
              <FeaturesSection />
              <AIDemoSection />
              <CTASection onCtaClick={handleCtaClick} />

              {/* Footer */}
              <footer className="border-t border-white/10 bg-black/50 backdrop-blur py-8 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <p className="text-white/50">© 2026 LogGPT. All rights reserved.</p>
                  <div className="flex gap-6 text-white/50">
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                    <a href="#" className="hover:text-white transition-colors">Status</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                  </div>
                </div>
              </footer>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{
              opacity: 0,
              filter: 'blur(10px)',
            }}
            animate={{
              opacity: 1,
              filter: 'blur(0px)',
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="min-h-screen bg-black"
          >
            <Workspace />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
