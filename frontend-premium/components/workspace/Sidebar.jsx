'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export function Sidebar({ sessions, activeSessionId, onSelectSession }) {
  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-80 border-r border-white/10 bg-black/60 backdrop-blur-lg flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            LogGPT
          </h1>
          <p className="text-xs text-white/50 mt-2">AI Observability</p>
        </motion.div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-4">
          Sessions
        </p>

        {sessions.map((session, index) => (
          <motion.button
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
              activeSessionId === session.id
                ? 'glass border border-cyan-500/50 bg-cyan-500/10'
                : 'hover:bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm line-clamp-1">{session.name}</h3>
              {activeSessionId === session.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-2 h-2 rounded-full bg-cyan-400"
                />
              )}
            </div>

            <p className="text-xs text-white/50">
              {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
            </p>

            <div className="flex gap-3 mt-3">
              <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                {session.logCount} logs
              </span>
              {session.anomalyCount > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                  ⚠️ {session.anomalyCount}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Connected
        </div>
      </div>
    </motion.aside>
  )
}
