'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/workspace/Sidebar'
import { MainContent } from '@/components/workspace/MainContent'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { getSessions } from '@/services/api'

export default function Workspace() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Refresh sessions and select a session by id
  const refreshSessions = async (selectId) => {
    setLoading(true)
    try {
      const data = await getSessions()
      setSessions(data)
      if (selectId) {
        setActiveSessionId(selectId)
      } else {
        setActiveSessionId(data[0]?.id || null)
      }
      setLoading(false)
    } catch (err) {
      setError('Failed to load sessions')
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSessions()
    // eslint-disable-next-line
  }, [])

  const activeSession = sessions.find(s => s.id === activeSessionId)

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
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          loading={loading}
          error={error}
        />
        {/* Main content */}
        <MainContent
          session={activeSession}
          loading={loading}
          error={error}
          onUploadSuccess={refreshSessions}
        />
      </motion.div>
    </div>
  )
}
