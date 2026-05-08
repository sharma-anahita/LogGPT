'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { UploadForm } from './UploadForm'
import { LogsPanel } from './LogsPanel'
import { AnomaliesPanel } from './AnomaliesPanel'
import { AISummaryPanel } from './AISummaryPanel'
import { getSessionLogs, getSessionAnomalies } from '@/services/api'

export function MainContent({ session, loading, error, onUploadSuccess }) {
  const [logs, setLogs] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [anomaliesLoading, setAnomaliesLoading] = useState(false)
  const [logsError, setLogsError] = useState(null)
  const [anomaliesError, setAnomaliesError] = useState(null)

  // ✅ Hook must be here — before any conditional return
  useEffect(() => {
    if (!session?.id) {
      setLogs([])
      setAnomalies([])
      return
    }

    setLogsLoading(true)
    setLogsError(null)
    getSessionLogs(session.id)
      .then(data => setLogs(data))
      .catch(() => setLogsError('Failed to load logs'))
      .finally(() => setLogsLoading(false))

    setAnomaliesLoading(true)
    setAnomaliesError(null)
    getSessionAnomalies(session.id)
      .then(data => setAnomalies(data))
      .catch(() => setAnomaliesError('Failed to load anomalies'))
      .finally(() => setAnomaliesLoading(false))
  }, [session?.id])

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-28 animate-pulse text-white/40">
          <span className="text-5xl mb-5">⏳</span>
          <span className="text-xl font-bold tracking-tight">Loading session data...</span>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-28 text-red-400 animate-pulse">
          <span className="text-5xl mb-5">❌</span>
          <span className="text-xl font-bold tracking-tight">{error}</span>
        </div>
      </main>
    )
  }

  if (!session?.id) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-28 text-white/30 animate-pulse">
          <span className="text-5xl mb-5">🪐</span>
          <span className="text-xl font-bold tracking-tight">No session selected.</span>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header session={session} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <UploadForm onUploadSuccess={onUploadSuccess} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AISummaryPanel session={session} />
          </motion.div>
          <div className="grid grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="col-span-2"
            >
              {logsLoading ? (
                <div className="glass p-6 rounded-xl border border-white/10 text-white/40 animate-pulse">Loading logs…</div>
              ) : logsError ? (
                <div className="glass p-6 rounded-xl border border-white/10 text-red-400">{logsError}</div>
              ) : (
                <LogsPanel logs={logs} sessionName={session?.name} />
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {anomaliesLoading ? (
                <div className="glass p-6 rounded-xl border border-white/10 text-white/40 animate-pulse">Loading anomalies…</div>
              ) : anomaliesError ? (
                <div className="glass p-6 rounded-xl border border-white/10 text-red-400">{anomaliesError}</div>
              ) : (
                <AnomaliesPanel anomalies={anomalies} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}