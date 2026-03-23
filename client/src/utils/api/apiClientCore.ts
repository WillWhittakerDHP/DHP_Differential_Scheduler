import axios, { type AxiosInstance, type AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'

/** Default JSON request headers (avoids inline hardcoded header map). */
// @audit-allow:hardcoding:inlineLabelMap - Canonical API headers constant
const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: JSON_HEADERS,
})

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (_error: AxiosError) => Promise.reject(_error)
)

export default apiClient
