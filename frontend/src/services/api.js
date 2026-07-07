import axios from 'axios'
import { sileo } from 'sileo'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('userInfo')
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    if (error.response?.status === 403) {
      sileo.error({
        title: 'Acceso denegado',
        description: error.response?.data?.message || 'No tienes permisos para realizar esta acción.',
      })
    }

    return Promise.reject(error)
  }
)

export default api
