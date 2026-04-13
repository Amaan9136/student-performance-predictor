import axios from 'axios'
const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', withCredentials: true })
export const setApiToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete API.defaults.headers.common['Authorization']
}
export const authAPI = {
  login: (d) => API.post('/auth/login', d),
  register: (d) => API.post('/auth/register', d),
  adminLogin: (d) => API.post('/auth/admin-login', d),
  me: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
}
export const studentAPI = {
  list: (q) => API.get(`/students${q ? `?q=${q}` : ''}`),
  add: (d) => API.post('/students', d),
  update: (id, d) => API.put(`/students/${id}`, d),
  remove: (id) => API.delete(`/students/${id}`),
  get: (id) => API.get(`/students/${id}`),
}
export const predictionAPI = {
  predict: (d) => API.post('/predictions/predict', d),
  history: () => API.get('/predictions/history'),
  aiAdvice: (d) => API.post('/predictions/ai-advice', d),
  reportAll: () => API.get('/predictions/report'),
}
export const adminAPI = {
  dashboard: () => API.get('/admin/dashboard'),
  students: (q) => API.get(`/admin/students${q ? `?q=${q}` : ''}`),
  users: (q) => API.get(`/admin/users${q ? `?q=${q}` : ''}`),
  trainModel: () => API.post('/admin/train'),
  deleteStudent: (id) => API.delete(`/admin/students/${id}`),
}
