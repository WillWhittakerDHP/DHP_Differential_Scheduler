/**
 * WHY: Max-work-hours writables split from useCapacitySettings (complexity / COMPOSABLE playbook).
 */

import type { Ref, WritableComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createNestedComputed } from '@/composables/admin/utils/nestedComputedFactory'
import { ROLLING_WEEK_DIRECTION_VALUES } from '@/constants/businessControlsOptions'
import type {
  CapacityFilterKey,
  UseCapacitySettingsParams,
  UseCapacitySettingsReturn,
} from '@/types/admin/capacitySettings'
import { buildMaxWorkNestedEnsurers } from '@/composables/admin/capacitySettings/useCapacityMaxWorkEnsures'

type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>

function createMaxWorkHoursComputed<F extends CapacityFilterKey, P extends keyof NonNullable<MaxWorkHours[F]>>(
  formData: Ref<AvailabilitySettings | null>,
  filter: F,
  property: P,
  getDefault: () => NonNullable<MaxWorkHours[F]>[P],
  ensureFunction: (current: MaxWorkHours | undefined) => MaxWorkHours
): WritableComputedRef<NonNullable<MaxWorkHours[F]>[P]> {
  return createNestedComputed<NonNullable<MaxWorkHours[F]>[P], MaxWorkHours>({
    getValue: () => {
      const filterValue = formData.value?.maxWorkHours?.[filter]
      if (!filterValue) return undefined
      if (property in filterValue) {
        return (filterValue as NonNullable<MaxWorkHours[F]>)[property]
      }
      return undefined
    },
    getDefault,
    getCurrentParent: () => formData.value?.maxWorkHours ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value: NonNullable<MaxWorkHours[F]>[P]) =>
      ({
        ...parent,
        [filter]: {
          ...parent[filter]!,
          [property]: value,
        },
      }) as MaxWorkHours,
    setParent: (parent) => {
      if (formData.value) formData.value.maxWorkHours = parent
    },
  })
}

export function buildMaxWorkHoursWritables(
  params: UseCapacitySettingsParams
): UseCapacitySettingsReturn['maxWorkHours'] {
  const { formData, maxBusinessHours } = params
  const { ensureWorkHoursPerDay, ensureCalendarWeekLimit, ensureRollingWeekLimit } =
    buildMaxWorkNestedEnsurers(maxBusinessHours)

  return {
    maxWorkHoursDayMaxHours: createMaxWorkHoursComputed(
      formData,
      'day',
      'maxHours',
      () => maxBusinessHours.value,
      ensureWorkHoursPerDay
    ),
    maxWorkHoursDayEnforcement: createMaxWorkHoursComputed(
      formData,
      'day',
      'enforcement',
      () => 'off' as const,
      ensureWorkHoursPerDay
    ),
    maxWorkHoursCalendarWeekMaxHours: createMaxWorkHoursComputed(
      formData,
      'calendarWeek',
      'maxHours',
      () => maxBusinessHours.value * 7,
      ensureCalendarWeekLimit
    ),
    maxWorkHoursCalendarWeekEnforcement: createMaxWorkHoursComputed(
      formData,
      'calendarWeek',
      'enforcement',
      () => 'off' as const,
      ensureCalendarWeekLimit
    ),
    maxWorkHoursRollingWeekMaxHours: createMaxWorkHoursComputed(
      formData,
      'rollingWeek',
      'maxHours',
      () => maxBusinessHours.value * 7,
      ensureRollingWeekLimit
    ),
    maxWorkHoursRollingWeekEnforcement: createMaxWorkHoursComputed(
      formData,
      'rollingWeek',
      'enforcement',
      () => 'off' as const,
      ensureRollingWeekLimit
    ),
    maxWorkHoursRollingWeekDirection: createMaxWorkHoursComputed(
      formData,
      'rollingWeek',
      'direction',
      () => ROLLING_WEEK_DIRECTION_VALUES.PAST,
      ensureRollingWeekLimit
    ),
  }
}
