/**
 * Wizard State Types
 * 
 * LEARNING: TypeScript types for booking wizard state
 * WHY: Provides type safety for wizard state management
 * PATTERN: Define types for wizard state and return type of useBookingWizard composable
 * 
 * Phase 1.3.1: Wizard State Management Refactoring
 */

import type { BookingBlockInstance, BookingData } from '@/utils/transformers/globalToBookingTransformer'
import type { ComputedRef, Ref } from 'vue'

/**
 * Wizard State Interface
 * LEARNING: Defines the structure of wizard state
 * WHY: Ensures type safety when accessing wizard state
 * PATTERN: Interface matching the state structure in useBookingWizard
 */
export interface WizardState {
  /** Currently selected state control block (dynamically determined from constituable: false block shapes) */
  selectedUserTypeBlock: BookingBlockInstance | null
  /** Array of selected service type blocks (multi-select) */
  selectedServiceTypeBlocks: BookingBlockInstance[]
  /** Array of selected availability options */
  selectedOptionTypeBlocks: BookingBlockInstance[]
  /** Array of selected property type blocks (multi-select) */
  selectedPropertyTypeBlocks: BookingBlockInstance[]
  /** Array of selected line item blocks (bookingMode: "addOn") */
  selectedLineItemBlocks: BookingBlockInstance[]
  /** Whether user only wants a quote (not booking) */
  isQuoteMode: boolean
}

/**
 * Wizard Selection Methods Interface
 * LEARNING: Defines methods for updating wizard state
 * WHY: Provides type safety for wizard state mutations
 * PATTERN: Interface matching the methods in useBookingWizard
 */
export interface WizardSelectionMethods {
  /** Select user type and clear dependent selections */
  selectUserTypeBlock: (block: BookingBlockInstance | null) => void
  /** Toggle service type block selection (single-select UI, array storage) */
  toggleServiceTypeBlock: (block: BookingBlockInstance) => void
  /** Toggle availability option selection */
  toggleOptionTypeBlock: (block: BookingBlockInstance) => void
  /** Toggle property type block selection (multi-select) */
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
  /** Toggle line item block selection (multi-select) */
  toggleLineItemBlock: (block: BookingBlockInstance) => void
  /** Run multiple wizard state updates without cascading clears (e.g. when loading an appointment) */
  batchUpdate: (fn: () => void) => void
}

/**
 * Wizard Computed Properties Interface
 * LEARNING: Defines computed properties for filtered options
 * WHY: Provides type safety for accessing filtered wizard options
 * PATTERN: Interface matching the computed properties in useBookingWizard
 */
export interface WizardComputedProperties {
  /** Available user types (all visible user types) */
  availableUserTypeBlocks: ComputedRef<BookingBlockInstance[]>
  /** Available services (filtered by selected user type) */
  availableServices: ComputedRef<BookingBlockInstance[]>
  /** Available availability options (filtered by selected services) */
  availableOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
  /** Available property type blocks (filtered by selected services) */
  availablePropertyTypeBlocks: ComputedRef<BookingBlockInstance[]>
  /** Available line item blocks (bookingMode: "addOn") */
  availableLineItemBlocks: ComputedRef<BookingBlockInstance[]>
  
  /** Error messages for cascade filtering */
  servicesCascadeError: ComputedRef<string | null>
  availabilityOptionsCascadeError: ComputedRef<string | null>
  propertyTypesCascadeError: ComputedRef<string | null>
  
  /** Accumulation computed properties for duration calculations */
  accServices: ComputedRef<BookingBlockInstance[]>
  accProperty: ComputedRef<BookingBlockInstance[]>
  accAvailability: ComputedRef<BookingBlockInstance[]>
}

/**
 * Use Booking Wizard Return Type
 * LEARNING: Complete return type for useBookingWizard composable
 * WHY: Provides full type safety when using the composable
 * PATTERN: Combines state, methods, and computed properties
 */
export type UseBookingWizardReturn = {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  selectedLineItemBlocks: Ref<BookingBlockInstance[]>
  isQuoteMode: Ref<boolean>
} & WizardSelectionMethods & WizardComputedProperties & {
  bookingData: ComputedRef<BookingData | null>
}

/**
 * Availability Step Data Interface
 * LEARNING: Type for availability step form data
 * WHY: Provides type safety for availability step data collection
 * PATTERN: Interface matching the structure used in AvailabilityStep component
 */
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { AvailabilityStepData } from '@/types/wizardStepData'

// FIX: Use shared AvailabilityStepData type from wizardStepData.ts
export type { AvailabilityStepData }

/**
 * Property Details Step Data Interface
 * LEARNING: Type for property details step form data
 * WHY: Provides type safety for property details step data collection
 * PATTERN: Interface matching the structure used in PropertyDetailsStep component
 * FIX: Use shared PropertyDetailsData type from propertyForm.ts
 */
export type PropertyDetailsStepData = PropertyDetailsData

/**
 * Contacts Step Data Interface
 * LEARNING: Type for contacts step form data
 * WHY: Provides type safety for contacts step data collection
 * PATTERN: Interface matching the structure used in ContactsStep component
 */
export interface ContactsStepData {
  clientInfo: { firstName: string; lastName: string; email: string }
  agentInfo: { firstName: string; lastName: string; email: string }
  anotherClientInfo: { firstName: string; lastName: string; email: string }
  transactionManagerInfo: { firstName: string; lastName: string; email: string }
  sellerInfo: { firstName: string; lastName: string; email: string }
  showAnotherClient: boolean
  showTransactionManager: boolean
  showSeller: boolean
}

/**
 * Confirmation Step Data Interface
 * LEARNING: Stub type for summary step; future "user acknowledged" / "terms accepted" can be added here
 * WHY: Enables useWizardStepSync pattern for ConfirmationStep without changing ref type later
 */
export interface ConfirmationStepData {
  acknowledged?: boolean
}

/**
 * Wizard Step Data and Validation Refs
 * 
 * LEARNING: Shared interface for wizard step data refs and validation state refs
 * WHY: Eliminates duplication between useWizardStepDataRefs and useWizardAppointmentManagement
 * PATTERN: Extract common interface properties to shared type
 */
export interface WizardStepDataAndValidationRefs {
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  contactsStepData: Ref<ContactsStepData | null>
  availabilityStepData: Ref<AvailabilityStepData | null>
  confirmationStepData: Ref<ConfirmationStepData | null>
  propertyDetailsStepValid: Ref<boolean>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValid: Ref<boolean>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValid: Ref<boolean>
  availabilityStepValidate: Ref<(() => boolean) | null>
  confirmationStepValid: Ref<boolean>
  confirmationStepValidate: Ref<(() => boolean) | null>
}