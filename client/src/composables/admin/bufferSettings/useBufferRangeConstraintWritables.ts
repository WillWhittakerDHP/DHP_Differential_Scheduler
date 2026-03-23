/**
 * WHY: Range constraints + overlap writables split from useBufferSettings (complexity / COMPOSABLE playbook).
 */

import { computed, type WritableComputedRef } from 'vue'
import type { AvailabilitySettings, ConstraintEnforcement } from '@/configs/availabilitySettings'
import { createNestedComputed, createEnsureNested } from '@/composables/admin/utils/nestedComputedFactory'
import { asEmptyObject } from '@/utils/safeDefaults'
import type { UseBufferSettingsParams } from '@/types/availabilitySettingsParams'

type RangeConstraints = NonNullable<AvailabilitySettings['rangeConstraints']>

export function buildBufferRangeConstraintWritables(params: UseBufferSettingsParams): {
  rangeConstraintsLeadTimeMinutes: WritableComputedRef<number>
  overlapSourcesOutOfOfficeEnforcement: WritableComputedRef<ConstraintEnforcement>
} {
  const { formData } = params

  const ensureRangeConstraints = (current: RangeConstraints | undefined): RangeConstraints =>
    asEmptyObject(current)

  const ensureLeadTimeConstraint = createEnsureNested(
    ensureRangeConstraints,
    'leadTime',
    () => ({
      type: 'leadTime' as const,
      enforcement: 'hard' as const,
      config: { minutes: 60 },
    })
  )

  const rangeConstraintsLeadTimeMinutes = createNestedComputed<number, RangeConstraints>({
    getValue: () => {
      const leadTime = formData.value?.rangeConstraints?.leadTime
      if (leadTime && leadTime.type === 'leadTime' && 'minutes' in leadTime.config) {
        return leadTime.config.minutes
      }
      return undefined
    },
    getDefault: () => 60,
    getCurrentParent: () => formData.value?.rangeConstraints ?? undefined,
    ensureParent: ensureLeadTimeConstraint,
    updateWithValue: (parent, value) => ({
      ...parent,
      leadTime: {
        ...parent.leadTime!,
        type: 'leadTime' as const,
        enforcement: parent.leadTime!.enforcement,
        config: { minutes: value },
      },
    }),
    setParent: (parent) => {
      if (formData.value) formData.value.rangeConstraints = parent
    },
  })

  const overlapSourcesOutOfOfficeEnforcement: WritableComputedRef<ConstraintEnforcement> = computed({
    get: (): ConstraintEnforcement => {
      return formData.value?.overlapSources?.outOfOffice?.enforcement ?? 'hard'
    },
    set: (value: ConstraintEnforcement) => {
      if (!formData.value) return
      formData.value.overlapSources = {
        ...formData.value.overlapSources,
        outOfOffice: {
          enforcement: value,
        },
      }
    },
  })

  return {
    rangeConstraintsLeadTimeMinutes,
    overlapSourcesOutOfOfficeEnforcement,
  }
}
