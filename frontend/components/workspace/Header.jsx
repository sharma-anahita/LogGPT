'use client'

import { motion } from 'framer-motion'

export function Header({ session }) {
  // DB returns snake_case: log_count, anomaly_count
  const logCount = session?.log_count ?? 0
  const anomalyCount = session?.anomaly_count ?? 0

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl py-6 px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-black text-white">{session?.name}</h2>
          <p className="text-sm text-white/50 mt-1">
            {logCount} logs • {anomalyCount} anomalies detected
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white/70">System Status</p>
            <p className="text-xs text-white/50 capitalize">{session?.status ?? 'Active'}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        </div>
      </motion.div>
    </header>
  )
}