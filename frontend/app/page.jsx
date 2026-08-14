'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CTASection } from '@/components/CTASection'
import Workspace from '@/components/Workspace'
import { isAuthenticated } from '@/services/auth'

export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to workspace
    if (isAuthenticated()) {
      router.push('/workspace')
    }
  }, [router])

  const handleCtaClick = () => {
    // Redirect to login page
    router.push('/login')
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        <AnimatedBackground />

        {/* Main content */}
        <div className="relative z-10">
          <HeroSection onCtaClick={handleCtaClick} />
          <FeaturesSection />
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
      </div>
    </>
  )
}
