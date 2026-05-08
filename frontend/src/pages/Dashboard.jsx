import { useState, useEffect } from 'react'
import ParticlesBackground from '../components/Background/ParticlesBackground'
import Sidebar from '../components/Layout/Sidebar'
import MainWorkspace from '../components/Layout/MainWorkspace'

// Mock data for Phase 1
const MOCK_SESSIONS = [
  {
    id: 1,
    name: 'Payment Service Outage',
    status: 'completed',
    log_count: 142,
    anomaly_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 2,
    name: 'Database Connection Pool Exhaustion',
    status: 'completed',
    log_count: 89,
    anomaly_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 3,
    name: 'API Gateway Timeout',
    status: 'processing',
    log_count: 256,
    anomaly_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

const MOCK_LOGS = [
  {
    id: 1,
    level: 'error',
    message: 'Payment gateway timeout after 5 retries',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    service: 'payment-service',
  },
  {
    id: 2,
    level: 'error',
    message: 'Database connection pool exhausted, waiting for available connection',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    service: 'payment-service',
  },
  {
    id: 3,
    level: 'warn',
    message: 'Backpressure detected on queue, slowing down requests',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    service: 'payment-service',
  },
  {
    id: 4,
    level: 'error',
    message: 'Failed to process 150 pending transactions',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    service: 'payment-service',
  },
  {
    id: 5,
    level: 'info',
    message: 'Service recovered, resuming normal operations',
    timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
    service: 'payment-service',
  },
]

const MOCK_ANOMALIES = [
  {
    id: 1,
    type: 'Error Spike',
    severity: 'critical',
    description: '500% increase in error rate detected over 5 minute window',
    start_time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    end_time: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 2,
    type: 'Resource Exhaustion',
    severity: 'high',
    description: 'Database connection pool at 95% capacity',
    start_time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    end_time: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
  {
    id: 3,
    type: 'Throughput Drop',
    severity: 'medium',
    description: 'Requests per second dropped by 60%',
    start_time: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    end_time: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
]

export default function Dashboard() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState(1)
  const [logs, setLogs] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false)

  const selectedSession = sessions.find((s) => s.id === activeSessionId)

  // Simulate loading logs when session changes
  useEffect(() => {
    setIsLoadingLogs(true)
    const timer = setTimeout(() => {
      setLogs(MOCK_LOGS)
      setIsLoadingLogs(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [activeSessionId])

  // Simulate loading anomalies when session changes
  useEffect(() => {
    setIsLoadingAnomalies(true)
    const timer = setTimeout(() => {
      setAnomalies(activeSessionId === 1 ? MOCK_ANOMALIES : [])
      setIsLoadingAnomalies(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [activeSessionId])

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId)
  }

  const handleUpload = () => {
    // Phase 3: Wire actual upload API
    console.log('Upload triggered')
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 flex">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
        />

        <MainWorkspace
          selectedSession={selectedSession}
          logs={logs}
          anomalies={anomalies}
          onUpload={handleUpload}
          isLoadingLogs={isLoadingLogs}
          isLoadingAnomalies={isLoadingAnomalies}
        />
      </div>
    </div>
  )
}
