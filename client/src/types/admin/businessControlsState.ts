/**
 * Shared provide/inject shape for Business Controls tab (constraints, calendar, wizard, rules).
 * WHY: Typed InjectionKey — wizardSettings is UseWizardSettingsReturn (flags | labels).
 * PATTERN: `BusinessControlsState` is `UnwrapNestedRefs<…>` so Volar matches template props to unwrapped values (reactive() deep-unwraps Ref/ComputedRef).
 */
import type { ComputedRef, Ref, UnwrapNestedRefs } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { UseWizardSettingsReturn } from '@/types/admin/wizardSettings'
import type { UseBusinessControlsFormStateReturn } from '@/composables/admin/useBusinessControlsFormState'
import type { UseCapacitySettingsReturn } from '@/composables/admin/useCapacitySettings'
import type { UseBufferSettingsReturn } from '@/composables/admin/useBufferSettings'
import type { UseDefaultLocationReturn } from '@/composables/admin/useDefaultLocation'
import type { UseDifferentialPerspectivesReturn } from '@/composables/admin/useDifferentialPerspectives'

/** Merged form slice for range, capacity, overlap, calendar, grid, and rounding panels. */
export type BusinessControlsFormState = UseBusinessControlsFormStateReturn['businessHours'] &
  UseBusinessControlsFormStateReturn['calendar'] &
  UseBusinessControlsFormStateReturn['rounding']

export type BusinessControlsSaveButtonProps = {
  type: 'submit'
  color: 'primary'
  loading: boolean
  disabled: boolean
}

/** Source shape before `reactive()`; refs/computed are unwrapped in consumers. */
export interface BusinessControlsStateSource {
  formState: BusinessControlsFormState
  /** Ref to availability constraints payload; used e.g. drive-time fee fields under Calendar → Holds. */
  availabilityFormData: Ref<AvailabilitySettings | null>
  wizardSettings: UseWizardSettingsReturn
  capacity: UseCapacitySettingsReturn
  buffers: UseBufferSettingsReturn
  location: UseDefaultLocationReturn
  differential: UseDifferentialPerspectivesReturn
  saveButtonProps: ComputedRef<BusinessControlsSaveButtonProps>
  autoConfirmEnabled: UseBusinessControlsFormStateReturn['calendar']['autoConfirmEnabled']
  calendarSaveSettings: () => Promise<void>
  wizardSaveSettings: () => Promise<void>
  constraintsSaveButtonProps: ComputedRef<BusinessControlsSaveButtonProps>
  calendarSaveButtonProps: ComputedRef<BusinessControlsSaveButtonProps>
  wizardSaveButtonProps: ComputedRef<BusinessControlsSaveButtonProps>
}

export type BusinessControlsState = UnwrapNestedRefs<BusinessControlsStateSource>
