/**
 * WHY: Booking Wizard Composable
LEARNING: Vue composable pattern for managing ...
 */
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useBooking } from '../useBooking'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { useWizardFilteredOptions } from './useWizardFilteredOptions'

/**
 * WHY: Booking Wizard Composable
WHY: Single source of truth for wizard state w...
 */
export function useBookingWizard(): UseBookingWizardReturn {
  const { bookingData } = useBooking()

  // LEARNING: Reactive state for wizard selections
  // PATTERN: Use ref for single values, ref([]) for arrays
  const selectedUserTypeBlock = ref<BookingBlockInstance | null>(null)
  const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array - renamed from selectedServices for consistency
  const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array - replaces selectedPropertyTypeBlock
  const selectedLineItemBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array for line item blocks (bookingMode: "addOn")

  // PATTERN: Use useStorage from VueUse for reactive localStorage binding
  const isQuoteMode = useStorage<boolean>('booking-wizard-quote-mode', false)

  /** When true, selection methods do not clear dependent selections (used by batchUpdate) */
  const _inBatch = ref(false)

  /**
   * Run multiple wizard state updates without cascading clears.
   * Use when loading an appointment so dependent selections are set in the same batch.
   */
  const batchUpdate = (fn: () => void): void => {
    _inBatch.value = true
    try {
      fn()
    } finally {
      _inBatch.value = false
    }
  }

  /**
   * WHY: /**
Select user type and clear dependent selections
LEARNING: Cascading ...
   */
  const selectUserTypeBlock = (block: BookingBlockInstance | null): void => {
    selectedUserTypeBlock.value = block
    if (!_inBatch.value) {
      selectedServiceTypeBlocks.value = []
      selectedOptionTypeBlocks.value = []
      selectedPropertyTypeBlocks.value = []
    }
  }

  /**
   * WHY: /**
Toggle service type block selection (single-select UI, array storage...
   */
  const toggleServiceTypeBlock = (block: BookingBlockInstance): void => {
    if (selectedServiceTypeBlocks.value.length === 1 && selectedServiceTypeBlocks.value[0].id === block.id) {
      selectedServiceTypeBlocks.value = []
    } else {
      selectedServiceTypeBlocks.value = [block]
    }
    if (!_inBatch.value) {
      selectedOptionTypeBlocks.value = []
      selectedPropertyTypeBlocks.value = []
    }
  }

  /**
   * WHY: /**
Toggle property type block selection (single-select UI, array storag...
   */
  const togglePropertyTypeBlock = (block: BookingBlockInstance): void => {
    if (selectedPropertyTypeBlocks.value.length === 1 && selectedPropertyTypeBlocks.value[0]?.id === block.id) {
      selectedPropertyTypeBlocks.value = []
      return
    }

    selectedPropertyTypeBlocks.value = [block]
  }

  /**
   * WHY: /**
Toggle availability option selection
LEARNING: Multi-select pattern ...
   */
  const toggleOptionTypeBlock = (block: BookingBlockInstance): void => {
    const index = selectedOptionTypeBlocks.value.findIndex(b => b.id === block.id)
    if (index >= 0) {
      selectedOptionTypeBlocks.value.splice(index, 1)
    } else {
      selectedOptionTypeBlocks.value.push(block)
    }
  }

  /**
   * WHY: /**
Toggle line item block selection
LEARNING: Multi-select pattern usin...
   */
  const toggleLineItemBlock = (block: BookingBlockInstance): void => {
    const index = selectedLineItemBlocks.value.findIndex(b => b.id === block.id)
    if (index >= 0) {
      selectedLineItemBlocks.value.splice(index, 1)
    } else {
      selectedLineItemBlocks.value.push(block)
    }
  }

  const {
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks,
    availablePropertyTypeBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    accServices,
    accProperty,
    accAvailability,
  } = useWizardFilteredOptions({
    bookingData,
    selectedUserType: selectedUserTypeBlock,
    selectedServiceTypeBlocks: selectedServiceTypeBlocks,
    selectedAvailabilityOptions: selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
  })

  return {
    selectedUserTypeBlock,
    selectedServiceTypeBlocks,
    selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
    selectedLineItemBlocks,
    isQuoteMode,
    selectUserTypeBlock,
    toggleServiceTypeBlock,
    toggleOptionTypeBlock,
    togglePropertyTypeBlock,
    toggleLineItemBlock,
    batchUpdate,
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks,
    availablePropertyTypeBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    accServices,
    accProperty,
    accAvailability,
    bookingData,
  }
}
