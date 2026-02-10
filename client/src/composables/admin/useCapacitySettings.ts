/**
 * Composable for capacity settings (max work hours per day, calendar week, rolling week)
 * WHY: Extracts capacity logic from BusinessControlsTab to reduce script size and complexity
 * PATTERN: Uses shared nestedComputedFactory; formData is single source of truth
 * @audit-allow loop-mutation:assignProp - Vue reactive form pattern (writable computed setters)
 */
import type { Ref, WritableComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import {
  createNestedComputed,
  createEnsureNested
} from '@/composables/admin/utils/nestedComputedFactory'

type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>
type CapacityFilterKey = 'day' | 'calendarWeek' | 'rollingWeek'

export interface UseCapacitySettingsParams {
  formData: Ref<AvailabilitySettings | null>
  maxBusinessHours: ComputedRef<number>
}

function createMaxWorkHoursComputed<TValue>(
  formData: Ref<AvailabilitySettings | null>,
  filter: CapacityFilterKey,
  property: string,
  getDefault: () => TValue,
  ensureFunction: (current: MaxWorkHours | undefined) => MaxWorkHours
) {
  return createNestedComputed<TValue, MaxWorkHours>({
    getValue: () => {
      const filterValue = formData.value?.maxWorkHours?.[filter]
      if (!filterValue) return undefined
      return (filterValue as unknown as Record<string, TValue>)[property]
    },
    getDefault,
    getCurrentParent: () => formData.value?.maxWorkHours ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) => ({
      ...parent,
      [filter]: {
        ...parent[filter]!,
        [property]: value
      }
    } as MaxWorkHours),
    setParent: (parent) => {
      if (formData.value) formData.value.maxWorkHours = parent
    }
  })
}

export function useCapacitySettings(params: UseCapacitySettingsParams): {
  maxWorkHoursDayMaxHours: WritableComputedRef<number>
  maxWorkHoursDayEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxWorkHoursCalendarWeekMaxHours: WritableComputedRef<number>
  maxWorkHoursCalendarWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxWorkHoursRollingWeekMaxHours: WritableComputedRef<number>
  maxWorkHoursRollingWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxWorkHoursRollingWeekDirection: WritableComputedRef<'past' | 'centered' | 'future'>
} {
  const { formData, maxBusinessHours } = params

  const ensureMaxWorkHours = (current: MaxWorkHours | undefined): MaxWorkHours =>
    current ?? {}

  const ensureWorkHoursPerDay = createEnsureNested(
    ensureMaxWorkHours,
    'day',
    () => ({
      maxHours: maxBusinessHours.value,
      enforcement: 'off' as const
    })
  )

  const ensureCalendarWeekLimit = createEnsureNested(
    ensureMaxWorkHours,
    'calendarWeek',
    () => ({
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off' as const
    })
  )

  const ensureRollingWeekLimit = createEnsureNested(
    ensureMaxWorkHours,
    'rollingWeek',
    () => ({
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off' as const,
      direction: 'past' as const
    }),
    (parent) => {
      if (parent.rollingWeek && !parent.rollingWeek.direction) {
        return {
          ...parent,
          rollingWeek: {
            ...parent.rollingWeek,
            direction: 'past' as const
          }
        }
      }
      return parent
    }
  )

  const maxWorkHoursDayMaxHours = createMaxWorkHoursComputed(
    formData,
    'day',
    'maxHours',
    () => maxBusinessHours.value,
    ensureWorkHoursPerDay
  )
  const maxWorkHoursDayEnforcement = createMaxWorkHoursComputed(
    formData,
    'day',
    'enforcement',
    () => 'off' as const,
    ensureWorkHoursPerDay
  )

  const maxWorkHoursCalendarWeekMaxHours = createMaxWorkHoursComputed(
    formData,
    'calendarWeek',
    'maxHours',
    () => maxBusinessHours.value * 7,
    ensureCalendarWeekLimit
  )
  const maxWorkHoursCalendarWeekEnforcement = createMaxWorkHoursComputed(
    formData,
    'calendarWeek',
    'enforcement',
    () => 'off' as const,
    ensureCalendarWeekLimit
  )

  const maxWorkHoursRollingWeekMaxHours = createMaxWorkHoursComputed(
    formData,
    'rollingWeek',
    'maxHours',
    () => maxBusinessHours.value * 7,
    ensureRollingWeekLimit
  )
  const maxWorkHoursRollingWeekEnforcement = createMaxWorkHoursComputed(
    formData,
    'rollingWeek',
    'enforcement',
    () => 'off' as const,
    ensureRollingWeekLimit
  )
  const maxWorkHoursRollingWeekDirection = createMaxWorkHoursComputed(
    formData,
    'rollingWeek',
    'direction',
    () => 'past' as const,
    ensureRollingWeekLimit
  )

  return {
    maxWorkHoursDayMaxHours,
    maxWorkHoursDayEnforcement,
    maxWorkHoursCalendarWeekMaxHours,
    maxWorkHoursCalendarWeekEnforcement,
    maxWorkHoursRollingWeekMaxHours,
    maxWorkHoursRollingWeekEnforcement,
    maxWorkHoursRollingWeekDirection
  }
}
