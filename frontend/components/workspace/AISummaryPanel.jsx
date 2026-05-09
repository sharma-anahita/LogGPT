'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

export function AISummaryPanel({ session }) {
  const [summary, setSummary] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState(null)
  const [runKey, setRunKey] = useState(0)

  const handleRefresh = () => {
    setIsComplete(false)
    setIsStreaming(false)
    setSummary('')
    setError(null)
    setRunKey(k => k + 1)
  }

  useEffect(() => {
    if (!session?.id) return

    let cancelled = false

    const run = async () => {
      setIsStreaming(true)
      setIsComplete(false)
      setSummary('')
      setError(null)

      try {
        const res = await api.post(`/sessions/${session.id}/summary`)
        if (cancelled) return

        const text = res.data?.summary ?? 'No summary available.'

        // Typewriter effect on the real response
        let i = 0
        const tick = () => {
          if (cancelled) return
          if (i <= text.length) {
            setSummary(text.slice(0, i))
            i++
            setTimeout(tick, 8)
          } else {
            setIsComplete(true)
            setIsStreaming(false)
          }
        }
        tick()
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.error ?? err.message
          setError(detail)
          setIsStreaming(false)
        }
      }
    }

    run()
    return () => { cancelled = true }
  }, [session?.id, runKey])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-8 rounded-xl border border-white/10 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 100% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-xs text-white/50">
                {isStreaming
                  ? 'Analyzing session data…'
                  : isComplete
                  ? 'Analysis complete'
                  : 'Waiting for session'}
              </p>
            </div>
          </div>

          {isStreaming && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-transparent border-t-cyan-400"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg p-4">
            ⚠️ {error}
          </div>
        )}

        {/* Summary text */}
        {!error && (
          <p className="text-sm text-white/80 leading-relaxed font-mono whitespace-pre-wrap min-h-[3rem]">
            {summary}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-5 bg-cyan-400 ml-1 align-text-bottom"
              />
            )}
          </p>
        )}

        {/* Actions */}
        {isComplete && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 pt-6 border-t border-white/10 flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigator.clipboard?.writeText(summary)}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              📋 Copy
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              🔄 Refresh
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}