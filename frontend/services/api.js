// Get logs for a session
export async function getSessionLogs(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/logs`)
  return res.data
}

// Get anomalies for a session
export async function getSessionAnomalies(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/anomalies`)
  return res.data
}
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export async function getSessions() {
  const res = await api.get('/sessions')
  return res.data
}


// Upload logs (file or text)
export async function uploadLogs({ sessionName, file, text }) {
  const formData = new FormData()
  formData.append('sessionName', sessionName)
  if (file) {
    formData.append('file', file)
  }
  if (text) {
    formData.append('text', text)
  }
  const res = await api.post('/logs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      // Progress handled in component
    },
  })
  return res.data
}

export default api
