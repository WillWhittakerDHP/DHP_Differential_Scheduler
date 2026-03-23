/**
 * WHY: Single ordering of user + service + property + option blocks for availability (pure).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function accumulateWizardSelectedBlockInstances(wizard: {
  selectedUserTypeBlock: { value: BookingBlockInstance | null }
  selectedServiceTypeBlocks: { value: BookingBlockInstance[] }
  selectedPropertyTypeBlocks: { value: BookingBlockInstance[] }
  selectedOptionTypeBlocks: { value: BookingBlockInstance[] }
}): BookingBlockInstance[] {
  return [
    ...(wizard.selectedUserTypeBlock.value ? [wizard.selectedUserTypeBlock.value] : []),
    ...wizard.selectedServiceTypeBlocks.value,
    ...wizard.selectedPropertyTypeBlocks.value,
    ...wizard.selectedOptionTypeBlocks.value,
  ]
}
