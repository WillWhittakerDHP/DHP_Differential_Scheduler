import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { CSRF_HEADER_NAME, readCsrfTokenFromDocumentCookie } from './csrfClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'

/** Default JSON request headers (avoids inline hardcoded header map). */
// @audit-allow:hardcoding:inlineLabelMap - Canonical API headers constant
const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

/** Methods that require CSRF header when a token cookie is present (matches server safe-method list). */
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

function attachCsrfHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const method = (config.method ?? 'get').toLowerCase()
  if (!MUTATING_METHODS.has(method)) {
    return config
  }
  const token = readCsrfTokenFromDocumentCookie()
  if (token === null || token === '') {
    return config
  }
  const headers = AxiosHeaders.from(config.headers)
  headers.set(CSRF_HEADER_NAME, token)
  config.headers = headers
  return config
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: JSON_HEADERS,
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config) => attachCsrfHeader(config),
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (_error: AxiosError) => Promise.reject(_error)
)

export default apiClient
