/**
 * Business hours validation for availability settings.
 */
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { AvailabilitySettings } from './types'
import { DAY_NAMES } from '@/constants/availabilitySettings'

/**
 * Validate that every day's business hours has end > start.
 */
export function validateBusinessHoursRange(
  businessHours: AvailabilitySettings['businessHours'],
  rfc3339ToHHmm: (rfc3339: RFC3339DateTime) => string
): { valid: boolean; errorMessage?: string } {
  for (let day = 0; day <= 6; day++) {
    const dayHours = businessHours[day as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    const [startHour, startMin] = rfc3339ToHHmm(dayHours.start).split(':').map(Number)
    const [endHour, endMin] = rfc3339ToHHmm(dayHours.end).split(':').map(Number)
    if (endHour * 60 + endMin <= startHour * 60 + startMin) {
      return { valid: false, errorMessage: `${DAY_NAMES[day]}: End time must be after start time` }
    }
  }
  return { valid: true }
}
