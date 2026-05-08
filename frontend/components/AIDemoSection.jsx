'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const sampleLogs = [
  { level: 'info', message: '[payment-service] Request processed', time: '14:32:12' },
  { level: 'info', message: '[api-gateway] Route: /v1/transactions', time: '14:32:12' },
  { level: 'warn', message: '[database] Query time exceeded 500ms', time: '14:32:13' },
  { level: 'error', message: '[payment-service] Connection timeout', time: '14:32:14' },
  { level: 'error', message: '[payment-service] Retry attempt 1/3', time: '14:32:15' },
  { level: 'info', message: '[cache] Clearing expired sessions', time: '14:32:16' },
  { level: 'warn', message: '[memory] Heap usage at 85%', time: '14:32:17' },
  { level: 'error', message: '[payment-service] Max retries exceeded', time: '14:32:18' },
  { level: 'error', message: '[payment-service] Circuit breaker opened', time: '14:32:19' },
  { level: 'info', message: '[alert-system] Anomaly detected: Error spike', time: '14:32:20' },
]

const anomalies = [
  { type: 'Error Spike', severity: 'critical', confidence: 0.98 },
  { type: 'Resource Exhaustion', severity: 'high', confidence: 0.92 },
  { type: 'Throughput Anomaly', severity: 'medium', confidence: 0.87 },
]

export function AIDemoSection() {
  const [displayedLogs, setDisplayedLogs] = useState([])
  const [displayedAnomalies, setDisplayedAnomalies] = useState([])

  useEffect(() => {
    // Simulate log streaming
    let logIndex = 0
    const logInterval = setInterval(() => {
      if (logIndex < sampleLogs.length) {
        setDisplayedLogs((prev) => [...prev, sampleLogs[logIndex]])
        logIndex++
      } else {
        clearInterval(logInterval)
        // Reset after showing all
        setTimeout(() => {
          setDisplayedLogs([])
          setDisplayedAnomalies([])
          logIndex = 0
        }, 3000)
      }
    }, 150)

    return () => clearInterval(logInterval)
  }, [])

  useEffect(() => {
    // Detect anomalies after certain log count
    if (displayedLogs.length >= 6 && displayedAnomalies.length === 0) {
      const anomalyTimeout = setTimeout(() => {
        setDisplayedAnomalies([anomalies[0]])
        setTimeout(() => setDisplayedAnomalies(anomalies.slice(0, 2)), 400)
        setTimeout(() => setDisplayedAnomalies(anomalies), 800)
      }, 300)
      return () => clearTimeout(anomalyTimeout)
    }
  }, [displayedLogs.length])

  const getLevelColor = (level) => {
    const colors = {
      error: 'text-red-400',
      warn: 'text-yellow-400',
      info: 'text-blue-400',
      debug: 'text-gray-400',
    }
    return colors[level] || colors.info
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-400 bg-red-400/10',
      high: 'text-orange-400 bg-orange-400/10',
      medium: 'text-yellow-400 bg-yellow-400/10',
      low: 'text-blue-400 bg-blue-400/10',
    }
    return colors[severity] || colors.medium
  }

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            Watch AI in Action
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            See how LogGPT processes logs and detects anomalies in real-time
          </p>
        </motion.div>

        {/* Demo container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logs viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-6 rounded-xl border border-white/10 h-96 overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <h3 className="font-semibold">Live Log Stream</h3>
              <span className="text-sm text-white/50 ml-auto">{displayedLogs.length} logs</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
              {displayedLogs?.map((log, index) => {
                if (!log) return null
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <span className="text-white/40">{log.time || '...'}</span>
                    <span className={`font-bold ${getLevelColor(log.level)}`}>
                      {log.level?.toUpperCase() || 'LOG'}
                    </span>
                    <span className="text-white/70">{log.message || ''}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Anomalies panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-6 rounded-xl border border-white/10 h-96 overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-semibold">AI Anomaly Detection</h3>
              <span className="text-sm text-white/50 ml-auto">{displayedAnomalies.length} detected</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {displayedAnomalies.map((anomaly, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.2,
                  }}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{anomaly.type}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Confidence:</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${anomaly.confidence * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-mono text-cyan-400">{(anomaly.confidence * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 glass p-6 rounded-xl border border-white/10"
        >
          <h4 className="font-semibold mb-2">🤖 AI Insight</h4>
          <p className="text-white/70">
            The system detected a 500% spike in error rates across the payment service within a 5-minute window. This correlates with database connection pool exhaustion at 95% capacity, causing cascading failures. Recommended action: scale database connections and implement circuit breaker recovery.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
