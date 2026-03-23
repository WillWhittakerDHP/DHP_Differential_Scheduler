/**
 * WHY: Buffer + drive-time writables split from useBufferSettings (complexity / COMPOSABLE playbook).
 */

import type { Ref, WritableComputedRef } from 'vue'
import type {
  AvailabilitySettings,
  BufferConfig,
  DriveTimeApplyTo,
  DriveTimeConfig,
} from '@/configs/availabilitySettings'
import { createNestedComputed, createEnsureNested } from '@/composables/admin/utils/nestedComputedFactory'
import { asEmptyObject } from '@/utils/safeDefaults'
import type { UseBufferSettingsParams } from '@/types/availabilitySettingsParams'

type Buffers = NonNullable<AvailabilitySettings['buffers']>

function createBuffersComputed<TValue>(
  formData: Ref<AvailabilitySettings | null>,
  bufferType: keyof Buffers,
  property: keyof BufferConfig,
  getDefault: () => TValue,
  ensureFunction: (current: Buffers | undefined) => Buffers
): WritableComputedRef<TValue> {
  return createNestedComputed<TValue, Buffers>({
    getValue: (): TValue | undefined => {
      const bufferValue = formData.value?.buffers?.[bufferType]
      if (!bufferValue) return undefined
      return (bufferValue as BufferConfig)[property] as TValue
    },
    getDefault,
    getCurrentParent: () => formData.value?.buffers ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) =>
      ({
        ...parent,
        [bufferType]: {
          ...parent[bufferType]!,
          [property]: value,
        },
      }) as Buffers,
    setParent: (parent) => {
      if (formData.value) formData.value.buffers = parent
    },
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
    getValue: (): TValue | undefined => {
      const bufferValue = formData.value?.buffers?.[bufferType]
      if (!bufferValue) return undefined
      return (bufferValue as DriveTimeConfig)[property] as TValue
    },
    getDefault,
    getCurrentParent: () => formData.value?.buffers ?? undefined,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) =>
      ({
        ...parent,
        [bufferType]: {
          ...parent[bufferType]!,
          [property]: value,
        },
      }) as Buffers,
    setParent: (parent) => {
      if (formData.value) formData.value.buffers = parent
    },
  })
}

export function buildBufferNestedWritables(params: UseBufferSettingsParams): {
  buffersAppointmentMinutes: WritableComputedRef<number>
  buffersAppointmentPlacement: WritableComputedRef<'off' | 'before' | 'after' | 'both'>
  buffersAppointmentEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveToCandidateMinutes: WritableComputedRef<number>
  buffersDriveToCandidateEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveToCandidateApplyTo: WritableComputedRef<DriveTimeApplyTo>
  buffersDriveFromCandidateMinutes: WritableComputedRef<number>
  buffersDriveFromCandidateEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
  buffersDriveFromCandidateApplyTo: WritableComputedRef<DriveTimeApplyTo>
} {
  const { formData } = params

  const ensureBuffers = (current: Buffers | undefined): Buffers => asEmptyObject(current)

  const ensureAppointmentBuffer = createEnsureNested(
    ensureBuffers,
    'appointment',
    () => ({
      type: 'appointment' as const,
      minutes: 0,
      placement: 'off' as const,
      enforcement: 'hard' as const,
    })
  )

  const ensureDriveToCandidate = createEnsureNested(
    ensureBuffers,
    'driveToCandidate',
    (): DriveTimeConfig => ({
      minutes: 30,
      enforcement: 'hard' as const,
      applyTo: 'skipDayStart' as const,
    })
  )

  const ensureDriveFromCandidate = createEnsureNested(
    ensureBuffers,
    'driveFromCandidate',
    (): DriveTimeConfig => ({
      minutes: 15,
      enforcement: 'hard' as const,
      applyTo: 'skipDayEnd' as const,
    })
  )

  return {
    buffersAppointmentMinutes: createBuffersComputed(formData, 'appointment', 'minutes', () => 0, ensureAppointmentBuffer),
    buffersAppointmentPlacement: createBuffersComputed(
      formData,
      'appointment',
      'placement',
      () => 'off' as const,
      ensureAppointmentBuffer
    ),
    buffersAppointmentEnforcement: createBuffersComputed(
      formData,
      'appointment',
      'enforcement',
      () => 'hard' as const,
      ensureAppointmentBuffer
    ),
    buffersDriveToCandidateMinutes: createDriveTimeComputed(
      formData,
      'driveToCandidate',
      'minutes',
      () => 30,
      ensureDriveToCandidate
    ),
    buffersDriveToCandidateEnforcement: createDriveTimeComputed(
      formData,
      'driveToCandidate',
      'enforcement',
      () => 'hard' as const,
      ensureDriveToCandidate
    ),
    buffersDriveToCandidateApplyTo: createDriveTimeComputed(
      formData,
      'driveToCandidate',
      'applyTo',
      () => 'skipDayStart' as const,
      ensureDriveToCandidate
    ),
    buffersDriveFromCandidateMinutes: createDriveTimeComputed(
      formData,
      'driveFromCandidate',
      'minutes',
      () => 15,
      ensureDriveFromCandidate
    ),
    buffersDriveFromCandidateEnforcement: createDriveTimeComputed(
      formData,
      'driveFromCandidate',
      'enforcement',
      () => 'hard' as const,
      ensureDriveFromCandidate
    ),
    buffersDriveFromCandidateApplyTo: createDriveTimeComputed(
      formData,
      'driveFromCandidate',
      'applyTo',
      () => 'skipDayEnd' as const,
      ensureDriveFromCandidate
    ),
  }
}
