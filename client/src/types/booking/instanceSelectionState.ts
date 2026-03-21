import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

export interface GenericWizardInstance {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  availableUserTypeBlocks: Ref<BookingBlockInstance[]>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  availableServices: Ref<BookingBlockInstance[]>
  selectUserTypeBlock: (userTypeBlock: BookingBlockInstance | null, skipCascade?: boolean) => void
  toggleServiceTypeBlock: (service: BookingBlockInstance, skipCascade?: boolean) => void
}

export interface UseInstanceSelectionStateParams {
  availableInstances: ComputedRef<BookingBlockInstance[]>
  selectedInstances: ComputedRef<BookingBlockInstance[]> | Ref<BookingBlockInstance[]>
  toggleSelection?: (instance: BookingBlockInstance, skipCascade?: boolean) => void
  loadedWizardState?: Ref<WizardStateData | null> | null
}

export interface UseInstanceSelectionStateReturn {
  selectedId: ComputedRef<string | null>
  selectedIds: ComputedRef<string[]>
}
