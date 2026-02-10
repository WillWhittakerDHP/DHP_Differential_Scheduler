/**
 * Composable for buffer settings (appointment, drive time) and lead time constraint
 * WHY: Extracts buffer and range-constraint logic from BusinessControlsTab
 * PATTERN: Uses shared nestedComputedFactory; formData is single source of truth
 * @audit-allow loop-mutation:assignProp - Vue reactive form pattern (writable computed setters)
 */
import { computed, type Ref, type WritableComputedRef } from 'vue'
import type {
  AvailabilitySettings,
  ConstraintEnforcement,
  DriveTimeConfig,
  DriveTimeApplyTo
} from '@/configs/availabilitySettings'
import { createNestedComputed, createEnsureNested } from '@/composables/admin/utils/nestedComputedFactory'

type Buffers = NonNullable<AvailabilitySettings['buffers']>
type RangeConstraints = NonNullable<AvailabilitySettings['rangeConstraints']>

export interface UseBufferSettingsParams {
  formData: Ref<AvailabilitySettings | null>
}

function createBuffersComputed<TValue>(
  formData: Ref<AvailabilitySettings | null>,
  bufferType: keyof Buffers,
  property: string,
  getDefault: () => TValue,
  ensureFunction: (current: Buffers | undefined) => Buffers
): WritableComputedRef<TValue> {
  return createNestedComputed<TValue, Buffers>({
    getValue: () => {
      const bufferValue = formData.value?.buffers?.[bufferType]
      if (!bufferValue) return undefined
      return (bufferValue as unknown as Record<string, TValue>)[property]
    },
    getDefault,
    getCurrentParent: () => formData.value?.buffers ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) => ({
      ...parent,
      [bufferType]: {
        ...parent[bufferType]!,
        [property]: value
      }
    } as Buffers),
    setParent: (parent) => {
      if (formData.value) formData.value.buffers = parent
    }
  })
}

function createDriveTimeComputed<TValue>(
  formData: Ref<AvailabilitySettings | null>,
  bufferType: 'driveToCandidate' | 'driveFromCandidate',
  property: keyof DriveTimeConfig,
  getDefault: () => TValue,
  ensureFunction: (current: Buffers | undefined) => Buffers
): WritableComputedRef<TValue> {
  return createNestedComputed<TValue, Buffers>({
    getValue: () => {
      const bufferValue = formData.value?.buffers?.[bufferType]
      if (!bufferValue) return undefined
      return (bufferValue as unknown as Record<string, TValue>)[property]
    },
    getDefault,
    getCurrentParent: () => formData.value?.buffers ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) => ({
      ...parent,
      [bufferType]: {
        ...parent[bufferType]!,
        [property]: value
      }
    } as Buffers),
    setParent: (parent) => {
      if (formData.value) formData.value.buffers = parent
    }
  })
}

export function useBufferSettings(params: UseBufferSettingsParams): {
  buffersAppointmentMinutes: WritableComputedRef<number>
  buffersAppointmentPlacement: WritableComputedRef<'off' | 'before' | 'after' | 'both'>
  buffersAppointmentEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveToCandidateMinutes: WritableComputedRef<number>
  buffersDriveToCandidateEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveToCandidateApplyTo: WritableComputedRef<DriveTimeApplyTo>
  buffersDriveFromCandidateMinutes: WritableComputedRef<number>
  buffersDriveFromCandidateEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveFromCandidateApplyTo: WritableComputedRef<DriveTimeApplyTo>
  rangeConstraintsLeadTimeMinutes: WritableComputedRef<number>
  overlapSourcesOutOfOfficeEnforcement: WritableComputedRef<ConstraintEnforcement>
} {
  const { formData } = params

  const ensureBuffers = (current: Buffers | undefined): Buffers => current ?? {}

  const ensureAppointmentBuffer = createEnsureNested(
    ensureBuffers,
    'appointment',
    () => ({
      type: 'appointment' as const,
      minutes: 0,
      placement: 'off' as const,
      enforcement: 'hard' as const
    })
  )

  const ensureDriveToCandidate = createEnsureNested(
    ensureBuffers,
    'driveToCandidate',
    (): DriveTimeConfig => ({
      minutes: 30,
      enforcement: 'hard' as const,
      applyTo: 'skipDayStart' as const
    })
  )

  const ensureDriveFromCandidate = createEnsureNested(
    ensureBuffers,
    'driveFromCandidate',
    (): DriveTimeConfig => ({
      minutes: 15,
      enforcement: 'hard' as const,
      applyTo: 'skipDayEnd' as const
    })
  )

  const buffersAppointmentMinutes = createBuffersComputed(
    formData,
    'appointment',
    'minutes',
    () => 0,
    ensureAppointmentBuffer
  )
  const buffersAppointmentPlacement = createBuffersComputed(
    formData,
    'appointment',
    'placement',
    () => 'off' as const,
    ensureAppointmentBuffer
  )
  const buffersAppointmentEnforcement = createBuffersComputed(
    formData,
    'appointment',
    'enforcement',
    () => 'hard' as const,
    ensureAppointmentBuffer
  )

  const buffersDriveToCandidateMinutes = createDriveTimeComputed(
    formData,
    'driveToCandidate',
    'minutes',
    () => 30,
    ensureDriveToCandidate
  )
  const buffersDriveToCandidateEnforcement = createDriveTimeComputed(
    formData,
    'driveToCandidate',
    'enforcement',
    () => 'hard' as const,
    ensureDriveToCandidate
  )
  const buffersDriveToCandidateApplyTo = createDriveTimeComputed(
    formData,
    'driveToCandidate',
    'applyTo',
    () => 'skipDayStart' as const,
    ensureDriveToCandidate
  )

  const buffersDriveFromCandidateMinutes = createDriveTimeComputed(
    formData,
    'driveFromCandidate',
    'minutes',
    () => 15,
    ensureDriveFromCandidate
  )
  const buffersDriveFromCandidateEnforcement = createDriveTimeComputed(
    formData,
    'driveFromCandidate',
    'enforcement',
    () => 'hard' as const,
    ensureDriveFromCandidate
  )
  const buffersDriveFromCandidateApplyTo = createDriveTimeComputed(
    formData,
    'driveFromCandidate',
    'applyTo',
    () => 'skipDayEnd' as const,
    ensureDriveFromCandidate
  )

  const ensureRangeConstraints = (current: RangeConstraints | undefined): RangeConstraints =>
    current ?? {}

  const ensureLeadTimeConstraint = createEnsureNested(
    ensureRangeConstraints,
    'leadTime',
    () => ({
      type: 'leadTime' as const,
      enforcement: 'hard' as const,
      config: { minutes: 60 }
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
        config: { minutes: value }
      }
    }),
    setParent: (parent) => {
      if (formData.value) formData.value.rangeConstraints = parent
    }
  })

  /**
   * LEARNING: WritableComputedRef for overlapSources.outOfOffice.enforcement
   * WHY: Follows the same reactive pattern as other settings but uses a simpler computed
   *      since overlapSources only has one level of nesting
   * PATTERN: Writable computed backed by formData.overlapSources.outOfOffice.enforcement
   */
  const overlapSourcesOutOfOfficeEnforcement = computed<ConstraintEnforcement>({
    get: (): ConstraintEnforcement => {
      return formData.value?.overlapSources?.outOfOffice?.enforcement ?? 'hard'
    },
    set: (value: ConstraintEnforcement) => {
      if (!formData.value) return
      formData.value.overlapSources = {
        ...formData.value.overlapSources,
        outOfOffice: {
          enforcement: value
        }
      }
    }
  })

  return {
    buffersAppointmentMinutes,
    buffersAppointmentPlacement,
    buffersAppointmentEnforcement,
    buffersDriveToCandidateMinutes,
    buffersDriveToCandidateEnforcement,
    buffersDriveToCandidateApplyTo,
    buffersDriveFromCandidateMinutes,
    buffersDriveFromCandidateEnforcement,
    buffersDriveFromCandidateApplyTo,
    rangeConstraintsLeadTimeMinutes,
    overlapSourcesOutOfOfficeEnforcement
  }
}
