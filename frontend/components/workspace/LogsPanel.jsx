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
    <div className="glass p-7 rounded-2xl border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">📋 Logs</h3>
        <span className="text-sm text-white/40 font-mono">{logs.length} entries</span>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-white/30 text-base animate-pulse">
          <span className="text-3xl mb-2">🗒️</span>
          No logs for this session.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2 max-h-96 overflow-y-auto pr-1"
        >
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              variants={itemVariants}
              whileHover={{ x: 6, boxShadow: '0 0 16px 2px rgba(0,240,255,0.10)', backgroundColor: 'rgba(0,240,255,0.03)' }}
              className={`p-4 rounded-xl border ${getLevelColor(log.level)} transition-smooth group`}
            >
              <div className="flex items-start gap-4">
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getLevelColor(log.level)} group-hover:text-cyan-300 transition-colors font-mono tracking-wide`}> 
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/40 font-mono">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                    <span className="text-xs text-white/50 font-mono bg-white/5 px-2 py-0.5 rounded ml-2">{log.service}</span>
                  </div>
                  <div className="text-sm text-white/90 font-medium leading-snug break-words">
                    {log.message}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
