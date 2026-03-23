/**
 * WHY: Max-income writables split from useCapacitySettings (complexity / COMPOSABLE playbook).
 */

import type { Ref, WritableComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createNestedComputed, createEnsureNested } from '@/composables/admin/utils/nestedComputedFactory'
import { ROLLING_WEEK_DIRECTION_VALUES } from '@/constants/businessControlsOptions'
import type {
  CapacityFilterKey,
  UseCapacitySettingsParams,
  UseCapacitySettingsReturn,
} from '@/types/admin/capacitySettings'

type MaxIncome = NonNullable<AvailabilitySettings['maxIncome']>

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
    updateWithValue: (parent, value: NonNullable<MaxIncome[F]>[P]) =>
      ({
        ...parent,
        [filter]: {
          ...parent[filter]!,
          [property]: value,
        },
      }) as MaxIncome,
    setParent: (parent) => {
      if (formData.value) formData.value.maxIncome = parent
    },
  })
}

export function buildMaxIncomeWritables(
  params: UseCapacitySettingsParams
): UseCapacitySettingsReturn['maxIncome'] {
  const { formData } = params

  const ensureMaxIncome = (current: MaxIncome | undefined): MaxIncome =>
    current !== undefined && current !== null ? current : {}

  const ensureIncomeDay = createEnsureNested(ensureMaxIncome, 'day', () => ({
    maxIncome: 0,
    enforcement: 'off' as const,
  }))
  const ensureIncomeCalendarWeek = createEnsureNested(ensureMaxIncome, 'calendarWeek', () => ({
    maxIncome: 0,
    enforcement: 'off' as const,
  }))
  const ensureIncomeRollingWeek = createEnsureNested(
    ensureMaxIncome,
    'rollingWeek',
    () => ({
      maxIncome: 0,
      enforcement: 'off' as const,
      direction: ROLLING_WEEK_DIRECTION_VALUES.PAST,
    }),
    (parent) => {
      if (parent.rollingWeek && !parent.rollingWeek.direction) {
        return {
          ...parent,
          rollingWeek: { ...parent.rollingWeek, direction: ROLLING_WEEK_DIRECTION_VALUES.PAST },
        }
      }
      return parent
    }
  )

  return {
    maxIncomeDayMaxIncome: createMaxIncomeComputed(formData, 'day', 'maxIncome', () => 0, ensureIncomeDay),
    maxIncomeDayEnforcement: createMaxIncomeComputed(
      formData,
      'day',
      'enforcement',
      () => 'off' as const,
      ensureIncomeDay
    ),
    maxIncomeCalendarWeekMaxIncome: createMaxIncomeComputed(
      formData,
      'calendarWeek',
      'maxIncome',
      () => 0,
      ensureIncomeCalendarWeek
    ),
    maxIncomeCalendarWeekEnforcement: createMaxIncomeComputed(
      formData,
      'calendarWeek',
      'enforcement',
      () => 'off' as const,
      ensureIncomeCalendarWeek
    ),
    maxIncomeRollingWeekMaxIncome: createMaxIncomeComputed(
      formData,
      'rollingWeek',
      'maxIncome',
      () => 0,
      ensureIncomeRollingWeek
    ),
    maxIncomeRollingWeekEnforcement: createMaxIncomeComputed(
      formData,
      'rollingWeek',
      'enforcement',
      () => 'off' as const,
      ensureIncomeRollingWeek
    ),
    maxIncomeRollingWeekDirection: createMaxIncomeComputed(
      formData,
      'rollingWeek',
      'direction',
      () => ROLLING_WEEK_DIRECTION_VALUES.PAST,
      ensureIncomeRollingWeek
    ),
  }
}
