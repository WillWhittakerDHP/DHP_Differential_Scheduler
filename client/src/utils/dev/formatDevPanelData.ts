/**
 * WHY: Dev Panel Data Formatting Utilities

LEARNING: Pure formatting functions...
 */
import {
  API_STATUS_COLOR_MAP,
  API_STATUS_LABEL_MAP,
  type ApiStatusValue,
} from '@/constants/apiStatus'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export function formatTimestamp(timestamp: number | string): string {
  const ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  return new Date(ms).toLocaleString()
}

export function formatTTL(ttl: number): string {
  const minutes = Math.floor(ttl / (60 * 1000))
  return `${minutes} min`
}

export function formatBusyPeriod(
  period: { start: RFC3339DateTime; end: RFC3339DateTime },
  formatDateTimeForDisplay: (date: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string,
  formatTimeForDisplay: (date: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  const start = new Date(period.start)
  const end = new Date(period.end)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  
  const startStr = formatDateTimeForDisplay(period.start, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  const endStr = formatTimeForDisplay(period.end, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${startStr} - ${endStr} (${durationMinutes} min)`
}

export function getApiStatusColor(status: ApiStatusValue): string {
  return API_STATUS_COLOR_MAP[status]
}

export function getApiStatusLabel(status: ApiStatusValue): string {
  return API_STATUS_LABEL_MAP[status]
}
