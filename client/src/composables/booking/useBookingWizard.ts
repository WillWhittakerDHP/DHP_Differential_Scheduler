/**
 * WHY: Booking Wizard Composable
 */
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useBooking } from '../useBooking'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseBookingWizardReturnGrouped, WizardMode } from '@/types/wizard'
import { useWizardFilteredOptions } from './useWizardFilteredOptions'

/**
 * WHY: Booking Wizard Composable
WHY: Single source of truth for wizard state w...
 */
export function useBookingWizard(): UseBookingWizardReturnGrouped {
  const { bookingData } = useBooking()

  // PATTERN: Use ref for single values, ref([]) for arrays
  const selectedUserTypeBlock = ref<BookingBlockInstance | null>(null)
  const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array - renamed from selectedServices for consistency
  const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array - replaces selectedPropertyTypeBlock
  const selectedCouponBlocks = ref<BookingBlockInstance[]>([]) // Single-select UI, array storage (same pattern as property type)
  const selectedLineItemBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array for line item blocks (bookingMode: "addOn")

  const persistedWizardMode = useStorage<WizardMode>('booking-wizard-mode', 'new')
  const _sessionMode = ref<WizardMode | null>(null)
  const wizardMode = computed(() => _sessionMode.value ?? persistedWizardMode.value)
  const isQuoteMode = computed(() => wizardMode.value === 'quote')

  // Optional migration: if user had quote preference under old key, move to new key and remove old key
  if (typeof localStorage !== 'undefined' && localStorage.getItem('booking-wizard-quote-mode') === 'true') {
    persistedWizardMode.value = 'quote'
    localStorage.removeItem('booking-wizard-quote-mode')
  }

  /** When true, selection methods do not clear dependent selections (used by batchUpdate) */
  const _inBatch = ref(false)

  const setWizardMode = (mode: WizardMode): void => {
    if (mode === 'reschedule') {
      _sessionMode.value = 'reschedule'
    } else {
      _sessionMode.value = null
      persistedWizardMode.value = mode
    }
  }

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
Select user type and clear dependent selections
   */
  const selectUserTypeBlock = (block: BookingBlockInstance | null): void => {
    selectedUserTypeBlock.value = block
    if (!_inBatch.value) {
      selectedServiceTypeBlocks.value = []
      selectedOptionTypeBlocks.value = []
      selectedPropertyTypeBlocks.value = []
      selectedCouponBlocks.value = []
    }
  }

  /**
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
      selectedCouponBlocks.value = []
    }
  }

  /**
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
Toggle availability option selection
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
   * Toggle coupon block selection (single-select UI, array of 0 or 1; same as property type).
   */
  const toggleCouponBlock = (block: BookingBlockInstance): void => {
    if (selectedCouponBlocks.value.length === 1 && selectedCouponBlocks.value[0]?.id === block.id) {
      selectedCouponBlocks.value = []
      return
    }
    selectedCouponBlocks.value = [block]
  }

  /**
Toggle line item block selection
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
    availableCouponBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    couponCascadeError,
    accServices,
    accProperty,
    accAvailability,
  } = useWizardFilteredOptions({
    bookingData,
    selectedUserType: selectedUserTypeBlock,
    selectedServiceTypeBlocks: selectedServiceTypeBlocks,
    selectedAvailabilityOptions: selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
    selectedCouponBlocks,
  })

  return {
    state: {
      selectedUserTypeBlock,
      selectedServiceTypeBlocks,
      selectedOptionTypeBlocks,
      selectedPropertyTypeBlocks,
      selectedCouponBlocks,
      selectedLineItemBlocks,
      isQuoteMode,
      wizardMode,
    },
    actions: {
      selectUserTypeBlock,
      toggleServiceTypeBlock,
      toggleOptionTypeBlock,
      togglePropertyTypeBlock,
      toggleCouponBlock,
      toggleLineItemBlock,
      batchUpdate,
      setWizardMode,
    },
    computed: {
      availableUserTypeBlocks,
      availableServices,
      availableOptionTypeBlocks,
      availablePropertyTypeBlocks,
      availableCouponBlocks,
      availableLineItemBlocks,
      servicesCascadeError,
      availabilityOptionsCascadeError,
      propertyTypesCascadeError,
      couponCascadeError,
      accServices,
      accProperty,
      accAvailability,
      bookingData,
    },
  }
}
