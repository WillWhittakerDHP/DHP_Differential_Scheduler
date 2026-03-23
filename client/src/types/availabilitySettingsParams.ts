/**
 * WHY: Canonical param shapes for composables that take AvailabilitySettings fo...
 */
import type { Ref, WritableComputedRef } from 'vue'
import type {
  AvailabilitySettings,
  ConstraintEnforcement,
  DriveTimeApplyTo,
} from '@/configs/availabilitySettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'

export interface AvailabilitySettingsFormParams {
  formData: Ref<AvailabilitySettings | null>
}

export type UseBufferSettingsParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseBufferSettingsParams' }

export interface UseBufferSettingsReturn {
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
}
export type UseDefaultLocationParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseDefaultLocationParams' }

export interface UseDifferentialPerspectivesParams extends AvailabilitySettingsFormParams {
  readonly __brand: 'UseDifferentialPerspectivesParams'
  /** When provided (Admin), label fields read/write here; otherwise availability formData.differentialPerspectives. */
  wizardFormData?: Ref<WizardSettingsData | null>
}
