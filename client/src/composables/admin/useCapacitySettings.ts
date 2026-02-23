import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import {
  createNestedComputed,
  createEnsureNested
} from '@/composables/admin/utils/nestedComputedFactory'

type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>
type MaxIncome = NonNullable<AvailabilitySettings['maxIncome']>
type CapacityFilterKey = 'day' | 'calendarWeek' | 'rollingWeek'

export interface UseCapacitySettingsParams {
  formData: Ref<AvailabilitySettings | null>
  maxBusinessHours: ComputedRef<number>
}

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
    updateWithValue: (parent, value: NonNullable<MaxWorkHours[F]>[P]) => ({
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

function createMaxIncomeComputed<F extends CapacityFilterKey, P extends keyof NonNullable<MaxIncome[F]>>(
  formData: Ref<AvailabilitySettings | null>,
  filter: F,
  property: P,
  getDefault: () => NonNullable<MaxIncome[F]>[P],
  ensureFunction: (current: MaxIncome | undefined) => MaxIncome
): WritableComputedRef<NonNullable<MaxIncome[F]>[P]> {
  return createNestedComputed<NonNullable<MaxIncome[F]>[P], MaxIncome>({
    getValue: () => {
      const filterValue = formData.value?.maxIncome?.[filter]
      if (!filterValue) return undefined
      if (property in filterValue) {
        return (filterValue as NonNullable<MaxIncome[F]>)[property]
      }
      return undefined
    },
    getDefault,
    getCurrentParent: () => formData.value?.maxIncome ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value: NonNullable<MaxIncome[F]>[P]) => ({
      ...parent,
      [filter]: {
        ...parent[filter]!,
        [property]: value
      }
    } as MaxIncome),
    setParent: (parent) => {
      if (formData.value) formData.value.maxIncome = parent
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
  maxIncomeDayMaxIncome: WritableComputedRef<number>
  maxIncomeDayEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxIncomeCalendarWeekMaxIncome: WritableComputedRef<number>
  maxIncomeCalendarWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxIncomeRollingWeekMaxIncome: WritableComputedRef<number>
  maxIncomeRollingWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  maxIncomeRollingWeekDirection: WritableComputedRef<'past' | 'centered' | 'future'>
} {
  const { formData, maxBusinessHours } = params

  const ensureMaxWorkHours = (current: MaxWorkHours | undefined): MaxWorkHours =>
    current !== undefined && current !== null ? current : {}

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

  const ensureMaxIncome = (current: MaxIncome | undefined): MaxIncome =>
    current !== undefined && current !== null ? current : {}

  const ensureIncomeDay = createEnsureNested(ensureMaxIncome, 'day', () => ({
    maxIncome: 0,
    enforcement: 'off' as const
  }))
  const ensureIncomeCalendarWeek = createEnsureNested(ensureMaxIncome, 'calendarWeek', () => ({
    maxIncome: 0,
    enforcement: 'off' as const
  }))
  const ensureIncomeRollingWeek = createEnsureNested(
    ensureMaxIncome,
    'rollingWeek',
    () => ({
      maxIncome: 0,
      enforcement: 'off' as const,
      direction: 'past' as const
    }),
    (parent) => {
      if (parent.rollingWeek && !parent.rollingWeek.direction) {
        return {
          ...parent,
          rollingWeek: { ...parent.rollingWeek, direction: 'past' as const }
        }
      }
      return parent
    }
  )

  const maxIncomeDayMaxIncome = createMaxIncomeComputed(
    formData,
    'day',
    'maxIncome',
    () => 0,
    ensureIncomeDay
  )
  const maxIncomeDayEnforcement = createMaxIncomeComputed(
    formData,
    'day',
    'enforcement',
    () => 'off' as const,
    ensureIncomeDay
  )
  const maxIncomeCalendarWeekMaxIncome = createMaxIncomeComputed(
    formData,
    'calendarWeek',
    'maxIncome',
    () => 0,
    ensureIncomeCalendarWeek
  )
  const maxIncomeCalendarWeekEnforcement = createMaxIncomeComputed(
    formData,
    'calendarWeek',
    'enforcement',
    () => 'off' as const,
    ensureIncomeCalendarWeek
  )
  const maxIncomeRollingWeekMaxIncome = createMaxIncomeComputed(
    formData,
    'rollingWeek',
    'maxIncome',
    () => 0,
    ensureIncomeRollingWeek
  )
  const maxIncomeRollingWeekEnforcement = createMaxIncomeComputed(
    formData,
    'rollingWeek',
    'enforcement',
    () => 'off' as const,
    ensureIncomeRollingWeek
  )
  const maxIncomeRollingWeekDirection = createMaxIncomeComputed(
    formData,
    'rollingWeek',
    'direction',
    () => 'past' as const,
    ensureIncomeRollingWeek
  )

  return {
    maxWorkHoursDayMaxHours,
    maxWorkHoursDayEnforcement,
    maxWorkHoursCalendarWeekMaxHours,
    maxWorkHoursCalendarWeekEnforcement,
    maxWorkHoursRollingWeekMaxHours,
    maxWorkHoursRollingWeekEnforcement,
    maxWorkHoursRollingWeekDirection,
    maxIncomeDayMaxIncome,
    maxIncomeDayEnforcement,
    maxIncomeCalendarWeekMaxIncome,
    maxIncomeCalendarWeekEnforcement,
    maxIncomeRollingWeekMaxIncome,
    maxIncomeRollingWeekEnforcement,
    maxIncomeRollingWeekDirection
  }
}
