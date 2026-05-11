'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { isAuthenticated } from '@/services/auth'
import { useDialog } from '@/components/dialogs/DialogProvider'

export function Sidebar({ sessions, activeSessionId, onSelectSession, loading, error, onCreateSession, onDeleteSession }) {
  const dialog = useDialog()

  const handleCreate = async () => {
    const result = await dialog.prompt({
      title: 'Create Session',
      message: 'Enter a name for this session.',
      confirmText: 'Create Session',
      cancelText: 'Cancel',
      tone: 'info',
      input: {
        label: 'Session name',
        placeholder: 'New session name',
        autoFocus: true,
      },
    })

    const name = result.value?.trim()
    if (!result.confirmed || !name) return
    if (onCreateSession) {
      await onCreateSession(name)
    }
  }
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
          {/* Create session button visible only when authenticated */}
          {typeof window !== 'undefined' && isAuthenticated() && (
            <div className="mt-3">
              <button
                onClick={handleCreate}
                className="px-3 py-1 text-sm rounded bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
              >
                + New Session
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-xs font-bold text-white/60 uppercase tracking-widest px-2 mb-5 letter-spacing-wide">
          Sessions
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-cyan-400/20 mb-3 animate-pulse" />
            <span className="text-white/40 text-sm">Loading sessions…</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
        {!loading && !error && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-white/40 text-sm">No sessions found.</span>
          </div>
        )}
        {!loading && !error && sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.07 * index }}
            whileHover={{ x: 6, boxShadow: '0 0 16px 2px rgba(0,240,255,0.10)' }}
            className={`w-full text-left px-5 py-4 rounded-xl transition-smooth duration-300 select-none group focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
              activeSessionId === session.id
                ? 'glass border border-cyan-400/60 bg-cyan-400/10 glow-cyan-lg shadow-lg'
                : 'hover:bg-white/5 border border-white/10'
            }`}
            style={{ minHeight: 72 }}
            role="button"
            tabIndex={0}
            onClick={() => onSelectSession(session.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectSession(session.id) }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-base tracking-tight line-clamp-1 text-white group-hover:text-cyan-300 transition-colors">
                {session.name}
              </h3>
              <div className="flex items-center gap-2">
                {activeSessionId === session.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-cyan-400/40 shadow-md"
                  />
                )}
                {/* Delete button */}
                {typeof window !== 'undefined' && isAuthenticated() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      dialog.confirm({
                        title: 'Delete Session',
                        message: `Delete \"${session.name}\"? This cannot be undone and will remove the session data from the database.`,
                        confirmText: 'Delete Session',
                        cancelText: 'Cancel',
                        tone: 'danger',
                      }).then((result) => {
                        if (!result.confirmed) return
                        if (typeof onDeleteSession === 'function') onDeleteSession(session.id)
                      })
                    }}
                    className="text-white/40 hover:text-red-400 text-sm px-2 py-1 rounded"
                    aria-label={`Delete session ${session.name}`}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-white/50 flex items-center gap-2">
              <span>{session.created_at ? formatDistanceToNow(new Date(session.created_at), { addSuffix: true }) : 'Just now'}</span>
              {session.status && (
                <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-white/40 text-[10px] align-middle">
                  {session.status}
                </span>
              )}
            </p>

            <div className="flex gap-3 mt-3">
              <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70 font-mono tracking-wide">
                {session.log_count || 0} logs
              </span>
              {session.anomaly_count > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 font-mono">
                  ⚠️ {session.anomaly_count}
                </span>
              )}
            </div>
          </motion.div>
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
