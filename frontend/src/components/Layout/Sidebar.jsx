import { motion } from 'framer-motion'
import SessionItem from './SessionItem'

export default function Sidebar({ sessions, activeSessionId, onSelectSession }) {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 w-80 h-screen glass z-40"
    >
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-glow">LogGPT</h1>
          <p className="text-xs text-gray-400 mt-2">AI Observability</p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            Sessions
          </h2>

          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onClick={() => onSelectSession(session.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No sessions yet</p>
              <p className="text-gray-600 text-xs mt-2">
                Upload logs to create one
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-gray-500">
            Connected • Ready for analysis
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
