/**
 * WHY: Keeps OverlapConstraintsPanel.vue thin; moves handler functions and label/hint computeds out of SFC.
 */
import { computed, inject } from 'vue'
import {
  BUSINESS_CONTROLS_STATE_KEY,
  type BusinessControlsState,
} from '@/views/admin/tabs/businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ENFORCEMENT_OPTIONS,
  BUFFER_PLACEMENT_OPTIONS,
  DRIVE_TIME_APPLY_TO_OPTIONS,
} from '@/constants/businessControlsOptions'
import type { ComputedRef } from 'vue'

export interface UseOverlapConstraintsPanelReturn {
  state: NonNullable<BusinessControlsState>
  UI_STRINGS: typeof BUSINESS_CONTROLS_TAB_STRINGS
  enforcementOptions: typeof ENFORCEMENT_OPTIONS
  bufferPlacementOptions: typeof BUFFER_PLACEMENT_OPTIONS
  driveTimeApplyToOptions: typeof DRIVE_TIME_APPLY_TO_OPTIONS
  defaultLocationPlaceId: ComputedRef<unknown>
  driveToMinutesLabel: ComputedRef<string>
  driveToMinutesHint: ComputedRef<string>
  driveFromMinutesLabel: ComputedRef<string>
  driveFromMinutesHint: ComputedRef<string>
  handleBuffersAppointmentMinutes: (v: number | string) => void
  handleBuffersAppointmentPlacement: (v: 'off' | 'before' | 'after' | 'both') => void
  handleBuffersAppointmentEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleBuffersDriveToCandidateMinutes: (v: number | string) => void
  handleBuffersDriveToCandidateApplyTo: (v: string) => void
  handleBuffersDriveToCandidateEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleBuffersDriveFromCandidateMinutes: (v: number | string) => void
  handleBuffersDriveFromCandidateApplyTo: (v: string) => void
  handleBuffersDriveFromCandidateEnforcement: (v: 'off' | 'flexible' | 'hard') => void
}

export function useOverlapConstraintsPanel(): UseOverlapConstraintsPanelReturn {
  const state = inject(BUSINESS_CONTROLS_STATE_KEY) as BusinessControlsState | undefined
  if (!state) throw new Error('OverlapConstraintsPanel must be used inside BusinessControlsTab')

  const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
  const enforcementOptions = ENFORCEMENT_OPTIONS
  const bufferPlacementOptions = BUFFER_PLACEMENT_OPTIONS
  const driveTimeApplyToOptions = DRIVE_TIME_APPLY_TO_OPTIONS

  const defaultLocationPlaceId = computed(() => state.location.defaultLocationPlaceId)
  const driveToMinutesLabel = computed(() =>
    defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupMinutesLabel : UI_STRINGS.driveTime.minutesLabel
  )
  const driveToMinutesHint = computed(() =>
    defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupHint : UI_STRINGS.hints.driveToCandidateMinutes
  )
  const driveFromMinutesLabel = computed(() =>
    defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupMinutesLabel : UI_STRINGS.driveTime.minutesLabel
  )
  const driveFromMinutesHint = computed(() =>
    defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupHint : UI_STRINGS.hints.driveFromCandidateMinutes
  )

  function handleBuffersAppointmentMinutes(v: number | string): void {
    state.buffers.buffersAppointmentMinutes = Number(v)
  }
  function handleBuffersAppointmentPlacement(v: 'off' | 'before' | 'after' | 'both'): void {
    state.buffers.buffersAppointmentPlacement = v
  }
  function handleBuffersAppointmentEnforcement(v: 'off' | 'flexible' | 'hard'): void {
    state.buffers.buffersAppointmentEnforcement = v
  }
  function handleBuffersDriveToCandidateMinutes(v: number | string): void {
    state.buffers.buffersDriveToCandidateMinutes = Number(v)
  }
  function handleBuffersDriveToCandidateApplyTo(v: string): void {
    state.buffers.buffersDriveToCandidateApplyTo = v
  }
  function handleBuffersDriveToCandidateEnforcement(v: 'off' | 'flexible' | 'hard'): void {
    state.buffers.buffersDriveToCandidateEnforcement = v
  }
  function handleBuffersDriveFromCandidateMinutes(v: number | string): void {
    state.buffers.buffersDriveFromCandidateMinutes = Number(v)
  }
  function handleBuffersDriveFromCandidateApplyTo(v: string): void {
    state.buffers.buffersDriveFromCandidateApplyTo = v
  }
  function handleBuffersDriveFromCandidateEnforcement(v: 'off' | 'flexible' | 'hard'): void {
    state.buffers.buffersDriveFromCandidateEnforcement = v
  }

  return {
    state,
    UI_STRINGS,
    enforcementOptions,
    bufferPlacementOptions,
    driveTimeApplyToOptions,
    defaultLocationPlaceId,
    driveToMinutesLabel,
    driveToMinutesHint,
    driveFromMinutesLabel,
    driveFromMinutesHint,
    handleBuffersAppointmentMinutes,
    handleBuffersAppointmentPlacement,
    handleBuffersAppointmentEnforcement,
    handleBuffersDriveToCandidateMinutes,
    handleBuffersDriveToCandidateApplyTo,
    handleBuffersDriveToCandidateEnforcement,
    handleBuffersDriveFromCandidateMinutes,
    handleBuffersDriveFromCandidateApplyTo,
    handleBuffersDriveFromCandidateEnforcement,
  }
}
