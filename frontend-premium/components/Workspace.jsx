'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/workspace/Sidebar'
import { MainContent } from '@/components/workspace/MainContent'
import { AnimatedBackground } from '@/components/AnimatedBackground'

const mockSessions = [
  {
    id: 1,
    name: 'Payment Service Outage',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    logCount: 142,
    anomalyCount: 3,
  },
  {
    id: 2,
    name: 'Database Connection Pool',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    logCount: 89,
    anomalyCount: 1,
  },
  {
    id: 3,
    name: 'API Gateway Timeout',
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    logCount: 256,
    anomalyCount: 5,
  },
]

export function Workspace() {
  const [activeSessionId, setActiveSessionId] = useState(mockSessions[0].id)

  const activeSession = mockSessions.find(s => s.id === activeSessionId)

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex h-screen"
      >
        {/* Sidebar */}
        <Sidebar
          sessions={mockSessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
        />

        {/* Main content */}
        <MainContent session={activeSession} />
      </motion.div>
    </div>
  )
}
