import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopnest_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Any 401 means the token is missing/expired -> bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('shopnest_token')
      localStorage.removeItem('shopnest_user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Pulls a readable message out of the backend's ApiError body. */
export function apiMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (data.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.entries(data.fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(', ')
  }
  return data.message || fallback
}

export default api
