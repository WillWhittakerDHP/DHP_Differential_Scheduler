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
import { useBooking } from './useBooking'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentResponse } from '@/types/appointment'
import { transformAppointmentToWizard, type WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { useWizardFilteredOptions } from '@/composables/booking/useWizardFilteredOptions'

/**
 * Booking Wizard Composable
 * LEARNING: Manages all wizard selections and provides filtered options
 * WHY: Single source of truth for wizard state with cascading filters
 * PATTERN: Reactive state + computed properties + selection methods
 * 
 * State Management:
 * - selectedUserTypeBlock: Currently selected state control block (dynamically determined from constituable: false block shapes)
 * - selectedServices: Array of selected services (single-select UI, but stored as array for consistency)
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
  // WHY: Enables reactive UI updates when selections change
  // PATTERN: Use ref for single values, ref([]) for arrays
  // Session 1.3.9.3: Updated to use arrays for multi-select support
  const selectedUserTypeBlock = ref<BookingBlockInstance | null>(null)
  const selectedServices = ref<BookingBlockInstance[]>([]) // Multi-select array - replaces selectedBaseService
  const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
  const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([]) // Multi-select array - replaces selectedPropertyTypeBlock
  const isQuoteMode = ref<boolean>(false)

  /**
   * Select user type and clear dependent selections
   * LEARNING: Cascading clear pattern - parent selection clears children
   * WHY: Ensures data consistency when parent selection changes
   * PATTERN: Set parent, clear all dependent selections
   * Session 1.3.9.3: Updated to clear arrays instead of single values
   * @param block - Block instance to select
   * @param skipCascade - If true, skip cascading clears (used during appointment loading)
   */
  const selectUserTypeBlock = (block: BookingBlockInstance | null, skipCascade = false): void => {
    selectedUserTypeBlock.value = block
    // Clear dependent selections when user type changes (unless loading appointment)
    if (!skipCascade) {
      selectedServices.value = []
      selectedOptionTypeBlocks.value = []
      selectedPropertyTypeBlocks.value = []
    }
  }

  /**
   * Select service (single-select UI, array storage)
   * LEARNING: Replace pattern for single-select UI with array storage
   * WHY: UI behaves as single-select (selecting one deselects others), but stored as array for consistency
   * PATTERN: Replace array with single selection (keeps array structure for backward compatibility)
   * Session 1.3.9.3: Changed from toggle to replace for single-select behavior
   * @param block - Block instance to select
   * @param skipCascade - If true, skip cascading clears (used during appointment loading)
   */
  const toggleService = (block: BookingBlockInstance, skipCascade = false): void => {
    // Single-select behavior: replace array with new selection
    // If clicking the same service, deselect it (empty array)
    if (selectedServices.value.length === 1 && selectedServices.value[0].id === block.id) {
      selectedServices.value = []
    } else {
      // Replace with new selection
      selectedServices.value = [block]
    }
    // Clear dependent selections when services change (unless loading appointment)
    if (!skipCascade) {
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
      // Deselect if clicking the already-selected property type
      selectedPropertyTypeBlocks.value = []
      return
    }

    // Replace with new selection (single-select behavior)
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

  const {
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks,
    availablePropertyTypeBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    accServices,
    accProperty,
    accAvailability,
  } = useWizardFilteredOptions({
    bookingData,
    selectedUserType: selectedUserTypeBlock,
    selectedServices,
    selectedAvailabilityOptions: selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
  })

  /**
   * Load appointment data into wizard state
   * LEARNING: Populates wizard state from appointment response
   * WHY: Enables loading existing appointments for testing/editing
   * PATTERN: Transform appointment to wizard state, then populate wizard selections
   * Phase 1.2.3: Added for mock data loading functionality
   * 
   * @param appointment - Appointment response from API
   * @returns Wizard state data for populating form fields
   */
  const loadAppointment = (appointment: AppointmentResponse): WizardStateData | null => {
    if (!bookingData.value) {
      return null
    }

    try {
      // Transform appointment to wizard state
      const wizardStateData = transformAppointmentToWizard(appointment, bookingData.value)
      
      /**
       * WHY: // WHY: Prevents clearing selections before they're all set, which causes cards to vanish
       * PATTERN: // PATTERN: Use skipCascade flag to disable cascading clears during appointment loading
       */
      selectUserTypeBlock(wizardStateData.userTypeBlock, true) // Skip cascade during load
      selectedServices.value = wizardStateData.services || []
      selectedPropertyTypeBlocks.value = wizardStateData.propertyTypeBlocks || []
      selectedOptionTypeBlocks.value = wizardStateData.optionTypeBlocks
      isQuoteMode.value = wizardStateData.isQuoteMode || false
      
      // Return wizard state data for form field population
      // Note: Form fields are managed in step components, so they need to be populated separately
      return wizardStateData
    } catch (error) {
      return null
    }
  }

  /**
   * Reset wizard state
   * LEARNING: Clears all wizard selections
   * WHY: Enables resetting wizard after loading appointment or starting fresh
   * PATTERN: Set all selections to null/empty
   * Phase 1.2.3: Added for mock data loading functionality
   * Session 1.3.9.3: Updated to clear arrays
   */
  const resetWizard = (): void => {
    selectedUserTypeBlock.value = null
    selectedServices.value = []
    selectedPropertyTypeBlocks.value = []
    selectedOptionTypeBlocks.value = []
    isQuoteMode.value = false
  }

  return {
    // State
    selectedUserTypeBlock,
    selectedServices,
    selectedOptionTypeBlocks,
    selectedPropertyTypeBlocks,
    isQuoteMode,
    // Methods
    selectUserTypeBlock,
    toggleService,
    toggleOptionTypeBlock,
    togglePropertyTypeBlock,
    loadAppointment,
    resetWizard,
    // Computed
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks,
    availablePropertyTypeBlocks,
    // Errors
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    // Accumulation computed properties
    accServices,
    accProperty,
    accAvailability,
    // Internal (for debugging/waiting)
    bookingData,
  }
}



