import type { Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { PropertyFormStateCore } from '@/types/booking/propertyDetailsLogic'

export interface UsePropertyFormWatchersParams extends PropertyFormStateCore {
  loadedWizardState: Ref<WizardStateData | null> | null
}

export type UsePropertyFormWatchersReturn = Record<string, never>
