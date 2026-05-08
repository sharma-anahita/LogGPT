import { useState, useEffect } from 'react'
import { sessionAPI } from '../services/api'

export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const response = await sessionAPI.getAll()
        setSessions(response.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch sessions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Uncomment in Phase 3 when ready to fetch real data
    // fetchSessions()
  }, [])

  return { sessions, isLoading, error }
}

export function useSessionDetails(sessionId) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return

    const fetchSession = async () => {
      setIsLoading(true)
      try {
        const response = await sessionAPI.getById(sessionId)
        setSession(response.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch session:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Uncomment in Phase 3 when ready to fetch real data
    // fetchSession()
  }, [sessionId])

  return { session, isLoading, error }
}
