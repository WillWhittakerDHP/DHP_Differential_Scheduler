/**
 * WHY: Dev Panel Data Formatting Utilities

 */
import {
  API_STATUS_COLOR_MAP,
  API_STATUS_LABEL_MAP,
  type ApiStatusValue,
} from '@/constants/apiStatus'

export function formatTimestamp(timestamp: number | string): string {
  const ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  return new Date(ms).toLocaleString()
}

export function formatTTL(ttl: number): string {
  const minutes = Math.floor(ttl / (60 * 1000))
  return `${minutes} min`
}

export function getApiStatusColor(status: ApiStatusValue): string {
  return API_STATUS_COLOR_MAP[status]
}

export function getApiStatusLabel(status: ApiStatusValue): string {
  return API_STATUS_LABEL_MAP[status]
}
