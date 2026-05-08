import { motion } from 'framer-motion'
import UploadForm from '../Upload/UploadForm'
import LogsViewer from '../Logs/LogsViewer'
import AnomalyPanel from '../Anomalies/AnomalyPanel'

export default function MainWorkspace({
  selectedSession,
  logs,
  anomalies,
  onUpload,
  isLoadingLogs,
  isLoadingAnomalies,
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="ml-80 h-screen overflow-y-auto p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {selectedSession ? selectedSession.name : 'LogGPT Dashboard'}
        </h1>
        {selectedSession && (
          <p className="text-gray-400">
            {selectedSession.log_count} logs • {selectedSession.anomaly_count} anomalies
          </p>
        )}
      </div>

      {/* Upload Form */}
      <UploadForm onUpload={onUpload} />

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Logs Viewer */}
        <div className="col-span-2">
          <LogsViewer logs={logs} isLoading={isLoadingLogs} />
        </div>

        {/* Anomaly Panel */}
        <div className="col-span-1">
          <AnomalyPanel anomalies={anomalies} isLoading={isLoadingAnomalies} />
        </div>
      </div>
    </motion.main>
  )
}
