/**
 * WHY: Nested ensure builders for max work hours (lowers nesting in buildMaxWorkHoursWritables).
 */

import type { ComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createEnsureNested } from '@/composables/admin/utils/nestedComputedFactory'
import { ROLLING_WEEK_DIRECTION_VALUES } from '@/constants/businessControlsOptions'

type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>

function normalizeRollingWeekDirection(parent: MaxWorkHours): MaxWorkHours {
  if (parent.rollingWeek && !parent.rollingWeek.direction) {
    return {
      ...parent,
      rollingWeek: {
        ...parent.rollingWeek,
        direction: ROLLING_WEEK_DIRECTION_VALUES.PAST,
      },
    }
  }
  return parent
}

export function buildMaxWorkNestedEnsurers(maxBusinessHours: ComputedRef<number>): {
  ensureWorkHoursPerDay: (current: MaxWorkHours | undefined) => MaxWorkHours
  ensureCalendarWeekLimit: (current: MaxWorkHours | undefined) => MaxWorkHours
  ensureRollingWeekLimit: (current: MaxWorkHours | undefined) => MaxWorkHours
} {
  const ensureMaxWorkHours = (current: MaxWorkHours | undefined): MaxWorkHours =>
    current !== undefined && current !== null ? current : {}

  const ensureWorkHoursPerDay = createEnsureNested(
    ensureMaxWorkHours,
    'day',
    () => ({
      maxHours: maxBusinessHours.value,
      enforcement: 'off' as const,
    })
  )

  const ensureCalendarWeekLimit = createEnsureNested(
    ensureMaxWorkHours,
    'calendarWeek',
    () => ({
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off' as const,
    })
  )

  const ensureRollingWeekLimit = createEnsureNested(
    ensureMaxWorkHours,
    'rollingWeek',
    () => ({
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off' as const,
      direction: ROLLING_WEEK_DIRECTION_VALUES.PAST,
    }),
    normalizeRollingWeekDirection
  )

  return { ensureWorkHoursPerDay, ensureCalendarWeekLimit, ensureRollingWeekLimit }
}
