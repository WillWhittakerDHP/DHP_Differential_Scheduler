import type { Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { computeNextAvailabilityOptionSelection } from '@/utils/booking/wizardAvailabilityOptionSync'

export interface BookingWizardSelectionRefs {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  selectedCouponBlocks: Ref<BookingBlockInstance[]>
  selectedLineItemBlocks: Ref<BookingBlockInstance[]>
  _inBatch: Ref<boolean>
}

export function bookingWizardSelectUserType(refs: BookingWizardSelectionRefs, block: BookingBlockInstance | null): void {
  refs.selectedUserTypeBlock.value = block
  if (!refs._inBatch.value) {
    refs.selectedServiceTypeBlocks.value = []
    refs.selectedOptionTypeBlocks.value = []
    refs.selectedPropertyTypeBlocks.value = []
    refs.selectedCouponBlocks.value = []
  }
}

export function bookingWizardToggleServiceTypeBlock(refs: BookingWizardSelectionRefs, block: BookingBlockInstance): void {
  if (refs.selectedServiceTypeBlocks.value.length === 1 && refs.selectedServiceTypeBlocks.value[0].id === block.id) {
    refs.selectedServiceTypeBlocks.value = []
  } else {
    refs.selectedServiceTypeBlocks.value = [block]
  }
  if (!refs._inBatch.value) {
    refs.selectedOptionTypeBlocks.value = []
    refs.selectedPropertyTypeBlocks.value = []
    refs.selectedCouponBlocks.value = []
  }
}

export function bookingWizardTogglePropertyTypeBlock(refs: BookingWizardSelectionRefs, block: BookingBlockInstance): void {
  if (
    refs.selectedPropertyTypeBlocks.value.length === 1 &&
    refs.selectedPropertyTypeBlocks.value[0]?.id === block.id
  ) {
    refs.selectedPropertyTypeBlocks.value = []
    return
  }
  refs.selectedPropertyTypeBlocks.value = [block]
}

export function bookingWizardToggleOptionTypeBlock(refs: BookingWizardSelectionRefs, block: BookingBlockInstance): void {
  const index = refs.selectedOptionTypeBlocks.value.findIndex((b) => b.id === block.id)
  if (index >= 0) {
    refs.selectedOptionTypeBlocks.value.splice(index, 1)
  } else {
    refs.selectedOptionTypeBlocks.value.push(block)
  }
}

export function bookingWizardToggleCouponBlock(refs: BookingWizardSelectionRefs, block: BookingBlockInstance): void {
  if (refs.selectedCouponBlocks.value.length === 1 && refs.selectedCouponBlocks.value[0]?.id === block.id) {
    refs.selectedCouponBlocks.value = []
    return
  }
  refs.selectedCouponBlocks.value = [block]
}

export function bookingWizardToggleLineItemBlock(refs: BookingWizardSelectionRefs, block: BookingBlockInstance): void {
  const index = refs.selectedLineItemBlocks.value.findIndex((b) => b.id === block.id)
  if (index >= 0) {
    refs.selectedLineItemBlocks.value.splice(index, 1)
  } else {
    refs.selectedLineItemBlocks.value.push(block)
  }
}

export function syncAvailabilityOptionSelectionFromAvailable(
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>,
  available: BookingBlockInstance[]
): void {
  const next = computeNextAvailabilityOptionSelection(available, selectedOptionTypeBlocks.value)
  if (next !== undefined) {
    selectedOptionTypeBlocks.value = next
  }
}

export function bookingWizardBatchUpdate(
  refs: BookingWizardSelectionRefs,
  availableOptionTypeBlocks: Ref<BookingBlockInstance[]>,
  fn: () => void
): void {
  refs._inBatch.value = true
  try {
    fn()
  } finally {
    refs._inBatch.value = false
    syncAvailabilityOptionSelectionFromAvailable(refs.selectedOptionTypeBlocks, availableOptionTypeBlocks.value)
  }
}
