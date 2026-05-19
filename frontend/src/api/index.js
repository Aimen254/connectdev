import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cd_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ─────────────────────────────────────────────────────
export const authLogin          = (d)      => api.post('/auth/login', d)
export const authRegister       = (d)      => api.post('/auth/register', d)
export const authGetMe          = ()       => api.get('/auth/me')
export const authChangePassword = (d)      => api.put('/auth/password', d)

// ── Feed ─────────────────────────────────────────────────────
export const feedGet            = (p)      => api.get('/feed', { params: p })
export const feedCreate         = (d)      => api.post('/feed', d)
export const feedGetPost        = (id)     => api.get(`/feed/${id}`)
export const feedUpdate         = (id, d)  => api.put(`/feed/${id}`, d)
export const feedDelete         = (id)     => api.delete(`/feed/${id}`)
export const feedToggleLike     = (id)     => api.post(`/feed/${id}/like`)
export const feedGetComments    = (id, p)  => api.get(`/feed/${id}/comments`, { params: p })
export const feedAddComment     = (id, d)  => api.post(`/feed/${id}/comments`, d)
export const feedDeleteComment  = (pid, cid) => api.delete(`/feed/${pid}/comments/${cid}`)
export const feedGetUserPosts   = (uid, p) => api.get(`/feed/user/${uid}`, { params: p })

// ── Network ──────────────────────────────────────────────────
export const netGetConnections  = (p)      => api.get('/network/connections', { params: p })
export const netGetRequests     = ()       => api.get('/network/requests')
export const netGetSent         = ()       => api.get('/network/sent')
export const netGetSuggestions  = (p)      => api.get('/network/suggestions', { params: p })
export const netSendRequest     = (id)     => api.post(`/network/request/${id}`)
export const netAcceptRequest   = (id)     => api.put(`/network/request/${id}/accept`)
export const netRejectRequest   = (id)     => api.put(`/network/request/${id}/reject`)
export const netRemove          = (id)     => api.delete(`/network/connections/${id}`)
export const netCancel          = (id)     => api.delete(`/network/request/${id}/cancel`)

// ── Notifications ─────────────────────────────────────────────
export const notifGet           = (p)      => api.get('/notifications', { params: p })
export const notifUnread        = ()       => api.get('/notifications/unread-count')
export const notifMarkAllRead   = ()       => api.put('/notifications/read-all')
export const notifMarkRead      = (id)     => api.put(`/notifications/${id}/read`)
export const notifDelete        = (id)     => api.delete(`/notifications/${id}`)

// ── Profile ──────────────────────────────────────────────────
export const profileGet         = (id)     => api.get(`/profile/${id}`)
export const profileUpdate      = (d)      => api.put('/profile', d)
export const profileAvatar       = (d)      => api.put('/profile/avatar', d)
export const profileUploadAvatar = (form)   => api.post('/profile/avatar/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
export const profileAddSkill    = (d)      => api.post('/profile/skills', d)
export const profileRemoveSkill = (s)      => api.delete(`/profile/skills/${encodeURIComponent(s)}`)

// ── Search ────────────────────────────────────────────────────
export const searchAll          = (q)      => api.get('/search', { params: { q } })
export const searchUsers        = (q, p)   => api.get('/search/users', { params: { q, ...p } })
export const searchPosts        = (q, p)   => api.get('/search/posts', { params: { q, ...p } })

export default api
