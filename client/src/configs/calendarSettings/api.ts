/**
 * API client for calendar_settings (GET /calendar-settings, PUT /calendar-settings).
 */
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { CalendarSettingsData } from './types'

const logger = createLogger('calendarSettings')

export async function getCalendarSettings(): Promise<CalendarSettingsData> {
  try {
    const response = await apiClient.get('/calendar-settings')
    const raw = response.data?.setting_value
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid API response: missing setting_value')
    }
    return raw as CalendarSettingsData
  } catch (error) {
    logger.error('Failed to fetch calendar settings', { error })
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch calendar settings: ${message}`)
  }
}

export function buildCalendarPayload(data: CalendarSettingsData): { setting_value: CalendarSettingsData } {
  return { setting_value: data }
}
