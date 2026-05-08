import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export async function getSessions() {
  const res = await api.get('/sessions')
  return res.data
}

export async function getSessionLogs(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/logs`)
  return res.data
}

export async function getSessionAnomalies(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/anomalies`)
  return res.data
}

export async function uploadLogs({ sessionName, file, text, onUploadProgress }) {
  // Backend expects JSON with a logs array, not multipart/form-data
  // Parse the file or text into a logs array first
  let logs = []

  if (file) {
    const content = await file.text()
    logs = parseLogsFromText(content)
  } else if (text) {
    logs = parseLogsFromText(text)
  }

  const res = await api.post(
    '/logs/upload',
    { sessionName, logs, service: 'uploaded' },
    {
      headers: { 'Content-Type': 'application/json' },
      onUploadProgress,
    }
  )
  return res.data
}

// Split raw text into an array of log lines (non-empty lines)
function parseLogsFromText(content) {
  try {
    // If it's a JSON array, use it directly
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
    return [parsed]
  } catch {
    // Otherwise split by newline
    return content
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
  }
}

export default api