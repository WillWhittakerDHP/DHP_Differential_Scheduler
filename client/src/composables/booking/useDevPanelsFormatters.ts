/**
 * PATTERN: Time and duration formatters for dev panels.
 * WHY: Keeps DevPanelsContainer.vue under vue-architecture script line limit.
 */
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { useLocalTime } from '@/composables/useLocalTime'

export function useDevPanelsFormatters() {
  const { formatDateTimeForDisplay } = useLocalTime()

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return 'N/A'
    return formatDateTimeForDisplay(isoString as RFC3339DateTime, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  return { formatTime, formatDuration }
}
