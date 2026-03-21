import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { WizardStepConfig } from '@/configs/wizardSteps'

export interface UseWizardDisplayParams {
  steps: WizardStepConfig[]
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface UseWizardDisplayReturn {
  stepSubtitles: ComputedRef<string[]>
  loadedServiceName: ComputedRef<string | null>
  loadedPropertyAddress: ComputedRef<string | null>
}
