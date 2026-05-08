'use client'

import { motion } from 'framer-motion'

export function AnomaliesPanel({ anomalies }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-l-2 border-red-500',
      high: 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500',
      medium: 'bg-yellow-500/20 text-yellow-400 border-l-2 border-yellow-500',
      low: 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500',
    }
    return colors[severity] || colors.medium
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: '🔴 CRITICAL',
      high: '🟠 HIGH',
      medium: '🟡 MEDIUM',
      low: '🔵 LOW',
    }
    return badges[severity] || badges.medium
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">⚡ Anomalies</h3>
        <motion.span
          animate={{
            boxShadow: [
              '0 0 10px rgba(255, 0, 0, 0)',
              '0 0 20px rgba(255, 0, 0, 0.3)',
              '0 0 10px rgba(255, 0, 0, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"
        >
          {anomalies.length} alerts
        </motion.span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 max-h-96 overflow-y-auto"
      >
        {anomalies.map((anomaly) => (
          <motion.div
            key={anomaly.id}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className={`p-4 rounded-lg ${getSeverityColor(anomaly.severity)} transition-all border`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">{anomaly.type}</h4>
              <span className="text-xs font-bold whitespace-nowrap ml-2">
                {getSeverityBadge(anomaly.severity)}
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed mb-3">
              {anomaly.description}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Confidence:</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${anomaly.confidence * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {(anomaly.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
