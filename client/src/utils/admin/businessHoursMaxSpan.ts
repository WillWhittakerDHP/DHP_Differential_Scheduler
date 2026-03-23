/**
 * WHY: Max single-day business span in hours (pure; caller supplies RFC→HH:mm converter).
 */

import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export function maxBusinessHoursFromWeeklySchedule(
  businessHours: AvailabilitySettings['businessHours'],
  rfc3339ToBusinessHoursHHmm: (rfc: RFC3339DateTime) => string
): number {
  return Math.max(
    ...Object.values(businessHours).map((day) => {
      const startTimeStr = rfc3339ToBusinessHoursHHmm(day.start)
      const endTimeStr = rfc3339ToBusinessHoursHHmm(day.end)
      const [startHour, startMin] = startTimeStr.split(':').map(Number)
      const [endHour, endMin] = endTimeStr.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return (endMinutes - startMinutes) / 60
    })
  )
}
