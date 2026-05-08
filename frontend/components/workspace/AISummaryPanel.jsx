'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function AISummaryPanel({ session }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const aiSummary = `Based on analysis of ${session?.logCount} logs across the ${session?.name} session, I've detected a critical incident pattern. The error spike at 14:32:14 correlates directly with database connection pool exhaustion reaching 95% capacity. This triggered cascading failures in the payment service with 150 pending transactions failing.

Root cause: Connection leak in the payment service query handler. The circuit breaker correctly isolated the failing service, preventing broader infrastructure impact.

Recommended actions:
1. Increase database connection pool size from 100 to 150
2. Implement connection timeout in payment service
3. Add circuit breaker recovery metrics to dashboards
4. Review connection leak patterns in logs`

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < aiSummary.length) {
        setDisplayedText(aiSummary.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsComplete(true)
      }
    }, 10)

    return () => clearInterval(interval)
  }, [session?.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-8 rounded-xl border border-white/10 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 100% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-xs text-white/50">Real-time incident summary</p>
            </div>
          </div>

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: isComplete ? 0 : 2,
              repeat: isComplete ? 0 : Infinity,
              ease: 'linear',
            }}
            className="w-4 h-4 rounded-full border-2 border-transparent border-t-cyan-400"
          />
        </div>

        <p className="text-sm text-white/80 leading-relaxed font-mono whitespace-pre-wrap">
          {displayedText}
          {!isComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-cyan-400 ml-1"
            />
          )}
        </p>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 pt-6 border-t border-white/10 flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              📋 Export
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              ✓ Resolve
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
