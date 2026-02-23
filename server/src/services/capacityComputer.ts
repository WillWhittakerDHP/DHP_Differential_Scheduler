
import type { CapacityConstraint } from '../../../shared/types/availabilityTypes.js'
import { TIME_BASIS_TYPES } from '../../../shared/constants/constraintConstants.js'
import {
  CapacityKeyParts,
  buildCapacityKey,
  capacityKeyToString,
} from '../../../shared/utils/capacityKeyUtils.js'
import {
  sumWorkHoursForDay,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  sumIncomeForDay,
  sumIncomeForCalendarWeek,
  sumIncomeForRollingWeek,
} from '../utils/availabilities/availabiltiesDbUtils.js'
import { getUniqueDatesInRange } from '../utils/availabilities/availabilityPrimitives.js'

export interface ScheduledCapacityResult {
  scheduledHoursByKey: Record<string, number>
  scheduledIncomeByKey: Record<string, number>
}

export async function computeScheduledHoursForRange(
  dateRange: { start: string; end: string },
  capacityConstraints: CapacityConstraint[]
): Promise<ScheduledCapacityResult> {
  const activeConstraints = capacityConstraints.filter(c => c.enforcement !== 'off')

  if (activeConstraints.length === 0) {
    return { scheduledHoursByKey: {}, scheduledIncomeByKey: {} }
  }

  const uniqueDates = getUniqueDatesInRange(dateRange.start, dateRange.end)
  const capacityKeyPartsSet = new Set<string>()
  const keyPartsMap = new Map<string, CapacityKeyParts>()

  for (const date of uniqueDates) {
    for (const constraint of activeConstraints) {
      const keyParts = buildCapacityKey(constraint, date)
      const keyString = capacityKeyToString(keyParts)
      capacityKeyPartsSet.add(keyString)
      keyPartsMap.set(keyString, keyParts)
    }
  }

  const scheduledHoursByKey: Record<string, number> = {}
  const scheduledIncomeByKey: Record<string, number> = {}

  await Promise.all(
    Array.from(capacityKeyPartsSet).map(async (keyString) => {
      const keyParts = keyPartsMap.get(keyString)!
      const datePart = keyString.split(':')[1]
      const dateObj = new Date(datePart + 'T00:00:00Z')

      let hours = 0
      let income = 0

      switch (keyParts.type) {
        case TIME_BASIS_TYPES.DAILY:
          hours = await sumWorkHoursForDay(dateObj)
          income = await sumIncomeForDay(dateObj)
          break
        case TIME_BASIS_TYPES.CALENDAR_WEEK:
          hours = await sumWorkHoursForCalendarWeek(dateObj)
          income = await sumIncomeForCalendarWeek(dateObj)
          break
        case TIME_BASIS_TYPES.ROLLING_WEEK:
          hours = await sumWorkHoursForRollingWeek(dateObj, keyParts.direction || 'past')
          income = await sumIncomeForRollingWeek(dateObj, keyParts.direction || 'past')
          break
      }

      scheduledHoursByKey[keyString] = hours
      scheduledIncomeByKey[keyString] = income
    })
  )

  return { scheduledHoursByKey, scheduledIncomeByKey }
}
