'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export function LogsPanel({ logs, sessionName }) {
  const getLevelColor = (level) => {
    const colors = {
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      warn: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      debug: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[level] || colors.info
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">📋 Logs</h3>
        <span className="text-sm text-white/50">{logs.length} entries</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2 max-h-96 overflow-y-auto"
      >
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            variants={itemVariants}
            whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            className={`p-3 rounded-lg border ${getLevelColor(log.level)} transition-colors`}
          >
            <div className="flex items-start gap-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>

              <div className="flex-1">
                <p className="text-sm text-white/90">{log.message}</p>
                <div className="flex gap-2 mt-1 text-xs text-white/50">
                  <span>{log.service}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
