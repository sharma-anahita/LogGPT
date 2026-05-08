import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export default function SessionItem({ session, isActive, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-3 mb-2 rounded-lg transition-smooth ${
        isActive
          ? 'glass glow-cyan bg-white/10 border-cyan-500/50'
          : 'glass hover:bg-white/8'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate text-white">
            {session.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(session.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded text-cyan-300">
            {session.log_count} logs
          </span>
        </div>
      </div>
      {session.anomaly_count > 0 && (
        <div className="mt-2 text-xs text-violet-400">
          ⚠️ {session.anomaly_count} anomalies
        </div>
      )}
    </motion.button>
  )
}
