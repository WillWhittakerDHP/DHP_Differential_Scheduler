/**
 * Booking Wizard Composable
 *
 * LEARNING: Vue composable pattern for managing wizard state
 * WHY: Centralizes all wizard selections and provides computed filtered options
 * PATTERN: Composable that uses reactive refs and computed properties
 * COMPARISON: React uses Context. Vue uses composables with reactive state
 *
 * Session 6.1: Booking Wizard State Management
 * Phase 6: Booking Wizard Logic Integration
 */

import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useBooking } from '../useBooking'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { useWizardFilteredOptions } from './useWizardFilteredOptions'

/**
 * Booking Wizard Composable
 * LEARNING: Manages all wizard selections and provides filtered options
 * WHY: Single source of truth for wizard state with cascading filters
 * PATTERN: Reactive state + computed properties + selection methods
 *
 * State Management:
 * - selectedUserTypeBlock: Currently selected state control block (dynamically determined from isStateControl: true block shapes)
 * - selectedServiceTypeBlocks: Array of selected service type blocks (single-select UI, but stored as array for consistency)
 * - selectedOptionTypeBlocks: Array of selected availability options
 * - selectedPropertyTypeBlocks: Array of selected property type blocks (property types)
 *
 * NOTE: Additional services functionality was removed - will be merged into base services in future work
 *
 * Cascading Logic:
 * - User Type selection filters available Base Services via activeBlockIds
 * - Base Service selection filters Availability Options and Property Adjustments via activeBlockIds
 * - Selecting a parent clears all dependent selections
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
   * Select user type and clear dependent selections
   * LEARNING: Cascading clear pattern - parent selection clears children
   * WHY: Ensures data consistency when parent selection changes
   * PATTERN: Set parent, clear all dependent selections (unless inside batchUpdate)
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
   * Toggle service type block selection (single-select UI, array storage)
   * LEARNING: Replace pattern for single-select UI with array storage
   * WHY: UI behaves as single-select (selecting one deselects others), but stored as array for consistency
   * PATTERN: Replace array with single selection (keeps array structure for backward compatibility)
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
   * Toggle property type block selection (single-select UI, array storage)
   * LEARNING: Replace pattern for single-select UI with array storage
   * WHY: Property type should behave like a radio group (pick one), but we keep array storage for consistency
   * PATTERN: Replace array with single selection; clicking the same selection deselects (empty array)
   */
  const togglePropertyTypeBlock = (block: BookingBlockInstance): void => {
    if (selectedPropertyTypeBlocks.value.length === 1 && selectedPropertyTypeBlocks.value[0]?.id === block.id) {
      selectedPropertyTypeBlocks.value = []
      return
    }

    selectedPropertyTypeBlocks.value = [block]
  }

  /**
   * Toggle availability option selection
   * LEARNING: Multi-select pattern using findIndex and splice/push
   * WHY: Allows multiple availability options to be selected
   * PATTERN: Check if exists, remove if found, add if not found
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
   * Toggle line item block selection
   * LEARNING: Multi-select pattern using findIndex and splice/push
   * WHY: Allows multiple line item blocks to be selected (bookingMode: "addOn")
   * PATTERN: Check if exists, remove if found, add if not found
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
