'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { UploadForm } from './UploadForm'
import { LogsPanel } from './LogsPanel'
import { AnomaliesPanel } from './AnomaliesPanel'
import { AISummaryPanel } from './AISummaryPanel'

const mockLogs = [
  { id: 1, level: 'error', service: 'payment-service', message: 'Payment gateway timeout after 5 retries', timestamp: Date.now() - 5 * 60000 },
  { id: 2, level: 'error', service: 'database', message: 'Database connection pool exhausted, waiting for available connection', timestamp: Date.now() - 4 * 60000 },
  { id: 3, level: 'warn', service: 'queue', message: 'Backpressure detected on queue, slowing down requests', timestamp: Date.now() - 3 * 60000 },
  { id: 4, level: 'error', service: 'payment-service', message: 'Failed to process 150 pending transactions', timestamp: Date.now() - 2 * 60000 },
  { id: 5, level: 'info', service: 'system', message: 'Service recovered, resuming normal operations', timestamp: Date.now() - 60000 },
]

const mockAnomalies = [
  { id: 1, type: 'Error Spike', description: '500% increase in error rate detected over 5 minute window', severity: 'critical', confidence: 0.98 },
  { id: 2, type: 'Resource Exhaustion', description: 'Database connection pool at 95% capacity', severity: 'high', confidence: 0.92 },
  { id: 3, type: 'Throughput Drop', description: 'Requests per second dropped by 60%', severity: 'medium', confidence: 0.87 },
]

export function MainContent({ session }) {
  const [logs, setLogs] = useState(mockLogs)
  const [anomalies, setAnomalies] = useState(mockAnomalies)

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header session={session} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-12">
          {/* Upload form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <UploadForm />
          </motion.div>

          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AISummaryPanel session={session} />
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="col-span-2"
            >
              <LogsPanel logs={logs} sessionName={session?.name} />
            </motion.div>

            {/* Anomalies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <AnomaliesPanel anomalies={anomalies} />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
