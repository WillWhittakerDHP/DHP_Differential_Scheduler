import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { globalCsrfToken } from '@/utils/api/csrfContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'

/** Default JSON request headers (avoids inline hardcoded header map). */
// @audit-allow:hardcoding:inlineLabelMap - Canonical API headers constant
const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: JSON_HEADERS,
  withCredentials: true,
})

function attachCsrfHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const method = config.method?.toLowerCase() ?? 'get'
  if (!['post', 'put', 'patch', 'delete'].includes(method)) {
    return config
  }
  const token = globalCsrfToken.value
  if (token !== null && token !== '') {
    const headers = (config.headers ?? {}) as Record<string, string>
    headers['X-CSRF-Token'] = token
    config.headers = headers as typeof config.headers
  }
  return config
}

apiClient.interceptors.request.use(
  (config) => attachCsrfHeader(config),
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (_error: AxiosError) => Promise.reject(_error)
)

export default apiClient
