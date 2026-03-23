/**
 * WHY: Booking Wizard Composable
 */
import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useBooking } from '../useBooking'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseBookingWizardReturnGrouped, WizardMode } from '@/types/wizard'
import { useWizardFilteredOptions } from './useWizardFilteredOptions'
import {
  bookingWizardBatchUpdate,
  bookingWizardSelectUserType,
  bookingWizardToggleCouponBlock,
  bookingWizardToggleLineItemBlock,
  bookingWizardToggleOptionTypeBlock,
  bookingWizardTogglePropertyTypeBlock,
  bookingWizardToggleServiceTypeBlock,
  syncAvailabilityOptionSelectionFromAvailable,
  type BookingWizardSelectionRefs,
} from '@/composables/booking/bookingWizardSelectionActions'

/**
 * WHY: Booking Wizard Composable
WHY: Single source of truth for wizard state w...
 */
export function useBookingWizard(): UseBookingWizardReturnGrouped {
  const { bookingData } = useBooking()

  const selectedUserTypeBlock = ref<BookingBlockInstance | null>(null)
  const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedCouponBlocks = ref<BookingBlockInstance[]>([])
  const selectedLineItemBlocks = ref<BookingBlockInstance[]>([])

  const persistedWizardMode = useStorage<WizardMode>('booking-wizard-mode', 'new')
  const _sessionMode = ref<WizardMode | null>(null)
  const wizardMode = computed(() => _sessionMode.value ?? persistedWizardMode.value)
  const isQuoteMode = computed(() => wizardMode.value === 'quote')

  if (typeof localStorage !== 'undefined' && localStorage.getItem('booking-wizard-quote-mode') === 'true') {
    persistedWizardMode.value = 'quote'
    localStorage.removeItem('booking-wizard-quote-mode')
  }

  const _inBatch = ref(false)

  const selectionRefs: BookingWizardSelectionRefs = {
    selectedUserTypeBlock,
    selectedServiceTypeBlocks,
    selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
    selectedCouponBlocks,
    selectedLineItemBlocks,
    _inBatch,
  }

  const setWizardMode = (mode: WizardMode): void => {
    if (mode === 'reschedule') {
      _sessionMode.value = 'reschedule'
    } else {
      _sessionMode.value = null
      persistedWizardMode.value = mode
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

  watch(
    availableOptionTypeBlocks,
    (available) => {
      if (_inBatch.value) return
      syncAvailabilityOptionSelectionFromAvailable(selectedOptionTypeBlocks, available)
    },
    { immediate: true }
  )

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
      selectUserTypeBlock: (block) => bookingWizardSelectUserType(selectionRefs, block),
      toggleServiceTypeBlock: (block) => bookingWizardToggleServiceTypeBlock(selectionRefs, block),
      toggleOptionTypeBlock: (block) => bookingWizardToggleOptionTypeBlock(selectionRefs, block),
      togglePropertyTypeBlock: (block) => bookingWizardTogglePropertyTypeBlock(selectionRefs, block),
      toggleCouponBlock: (block) => bookingWizardToggleCouponBlock(selectionRefs, block),
      toggleLineItemBlock: (block) => bookingWizardToggleLineItemBlock(selectionRefs, block),
      batchUpdate: (fn) => bookingWizardBatchUpdate(selectionRefs, availableOptionTypeBlocks, fn),
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
