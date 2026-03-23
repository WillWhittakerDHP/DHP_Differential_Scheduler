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
import {
  restoreMultiCascadeSelection,
  restoreSingleCascadeSelection,
  wizardCascadeBlockIds,
} from '@/utils/booking/wizardCascadeReselect'

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

  const selectUserTypeBlockWithCascadeReselect = (block: BookingBlockInstance | null): void => {
    const prevServiceIds = wizardCascadeBlockIds(selectedServiceTypeBlocks.value)
    const prevPropertyIds = wizardCascadeBlockIds(selectedPropertyTypeBlocks.value)
    const prevOptionIds = wizardCascadeBlockIds(selectedOptionTypeBlocks.value)
    const prevCouponIds = wizardCascadeBlockIds(selectedCouponBlocks.value)

    bookingWizardSelectUserType(selectionRefs, block)

    if (block === null) {
      return
    }

    selectedServiceTypeBlocks.value = restoreSingleCascadeSelection(prevServiceIds, availableServices.value)
    selectedPropertyTypeBlocks.value = restoreSingleCascadeSelection(prevPropertyIds, availablePropertyTypeBlocks.value)
    selectedOptionTypeBlocks.value = restoreMultiCascadeSelection(prevOptionIds, availableOptionTypeBlocks.value)
    selectedCouponBlocks.value = restoreSingleCascadeSelection(prevCouponIds, availableCouponBlocks.value)
  }

  const toggleServiceTypeBlockWithCascadeReselect = (block: BookingBlockInstance): void => {
    const prevPropertyIds = wizardCascadeBlockIds(selectedPropertyTypeBlocks.value)
    const prevOptionIds = wizardCascadeBlockIds(selectedOptionTypeBlocks.value)
    const prevCouponIds = wizardCascadeBlockIds(selectedCouponBlocks.value)

    bookingWizardToggleServiceTypeBlock(selectionRefs, block)

    selectedPropertyTypeBlocks.value = restoreSingleCascadeSelection(prevPropertyIds, availablePropertyTypeBlocks.value)
    selectedOptionTypeBlocks.value = restoreMultiCascadeSelection(prevOptionIds, availableOptionTypeBlocks.value)
    selectedCouponBlocks.value = restoreSingleCascadeSelection(prevCouponIds, availableCouponBlocks.value)
  }

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
      selectUserTypeBlock: selectUserTypeBlockWithCascadeReselect,
      toggleServiceTypeBlock: toggleServiceTypeBlockWithCascadeReselect,
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
