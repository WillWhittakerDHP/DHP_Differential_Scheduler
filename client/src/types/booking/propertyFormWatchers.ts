import type { Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { PropertyFormStateCore } from '@/types/booking/propertyDetailsLogic'
import type { PropertyDetailsData } from '@/types/propertyForm'

export interface UsePropertyFormWatchersParams extends PropertyFormStateCore {
  loadedWizardState: Ref<WizardStateData | null> | null
  /** Restore form from parent step data when returning to step (wizard persistence). */
  restoreFrom?: Ref<PropertyDetailsData | null>
}

export type UsePropertyFormWatchersReturn = Record<string, never>
