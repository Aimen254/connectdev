import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Auto-attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cd_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)

// Profile endpoints (for later)
export const getProfile = (id) => api.get(`/users/${id}`)
export const updateProfile = (data) => api.put('/users/me', data)

export default api