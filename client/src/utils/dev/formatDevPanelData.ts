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

/**
 * Format timestamp for display
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date/time string
 */
export function formatTimestamp(timestamp: number | string): string {
  const ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  return new Date(ms).toLocaleString()
}

/**
 * Format TTL (time to live) for display
 * LEARNING: Converts milliseconds to minutes
 * 
 * @param ttl - Time to live in milliseconds
 * @returns Formatted string like "5 min"
 */
export function formatTTL(ttl: number): string {
  const minutes = Math.floor(ttl / (60 * 1000))
  return `${minutes} min`
}

/**
 * Format busy period for display
 * 
 * @param period - Busy period with start and end times
 * @param formatDateTimeForDisplay - Function to format date/time
 * @param formatTimeForDisplay - Function to format time
 * @returns Formatted string like "Jan 15, 2:00 PM - 4:00 PM (120 min)"
 */
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

/**
 * Get API status chip color
 * WHY: Replaces switch statement with constant lookup
 * 
 * @param status - API status value
 * @returns Vuetify color name
 */
export function getApiStatusColor(status: ApiStatusValue): string {
  return API_STATUS_COLOR_MAP[status]
}

/**
 * Get API status display label
 * WHY: Replaces switch statement with constant lookup
 * 
 * @param status - API status value
 * @returns Display label string
 */
export function getApiStatusLabel(status: ApiStatusValue): string {
  return API_STATUS_LABEL_MAP[status]
}
