import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Sessions API
export const sessionAPI = {
  getAll: () => api.get('/sessions'),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  updateStatus: (id, status) => api.patch(`/sessions/${id}/status`, { status }),
  delete: (id) => api.delete(`/sessions/${id}`),
}

// Logs API
export const logsAPI = {
  upload: (data) => api.post('/logs/upload', data),
  getBySession: (sessionId, limit = 100, offset = 0) =>
    api.get(`/sessions/${sessionId}/logs`, { params: { limit, offset } }),
}

// Anomalies API
export const anomaliesAPI = {
  getBySession: (sessionId) => api.get(`/sessions/${sessionId}/anomalies`),
}

export default api
