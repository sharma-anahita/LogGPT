import { motion } from 'framer-motion'

export default function AnomalyPanel({ anomalies, isLoading }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="glass p-6 rounded-xl h-96 flex flex-col"
    >
      <h2 className="text-lg font-semibold mb-4">⚡ Anomalies</h2>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border border-violet-500 border-t-transparent" />
        </div>
      ) : anomalies && anomalies.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          {anomalies.map((anomaly, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-sm p-4 rounded border ${getSeverityColor(
                anomaly.severity
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{anomaly.type}</h3>
                  <p className="text-xs mt-2 text-gray-300">
                    {anomaly.description}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2">
                  {anomaly.severity?.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-500 text-sm">✓ No anomalies detected</p>
        </div>
      )}
    </motion.div>
  )
}
