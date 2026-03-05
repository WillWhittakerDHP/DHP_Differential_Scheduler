/**

...
 */
import type { BookingBlockInstance, BookingData } from '@/utils/transformers/globalToBookingTransformer'
import type { ComputedRef, Ref } from 'vue'

/**
 * Wizard mode: 'new' (create), 'quote' (quote flow), 'reschedule' (load existing and land at step 3).
 * Used so submit step can show "Update appointment" and call update path when mode is reschedule.
 */
export type WizardMode = 'new' | 'quote' | 'reschedule'

/**
 * WHY: Wizard State Interface
P...
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
  /** Mode for wizard flow: new, quote, or reschedule (load-at-step-3 + update path) */
  wizardMode: WizardMode
}

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
  /** Set wizard mode (new, quote, reschedule). Entry points set 'reschedule' then call handleLoadAppointment(id). */
  setWizardMode: (mode: WizardMode) => void
}

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

/** Flat shape provided/injected. isQuoteMode is a convenience derived from wizardMode (wizardMode === 'quote'). */
export type UseBookingWizardReturn = {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  selectedLineItemBlocks: Ref<BookingBlockInstance[]>
  isQuoteMode: Ref<boolean>
  wizardMode: Ref<WizardMode>
} & WizardSelectionMethods & WizardComputedProperties & {
  bookingData: ComputedRef<BookingData | null>
}

/** Grouped return for composable-health (oversized-return repair). Tab spreads to flat when providing. */
export interface UseBookingWizardReturnGrouped {
  state: {
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    isQuoteMode: Ref<boolean>
    wizardMode: Ref<WizardMode>
  }
  actions: WizardSelectionMethods
  computed: WizardComputedProperties & { bookingData: ComputedRef<BookingData | null> }
}

import type { PropertyDetailsData } from '@/types/propertyForm'
import type { AvailabilityStepData } from '@/types/wizardStepData'

// FIX: Use shared AvailabilityStepData type from wizardStepData.ts
export type { AvailabilityStepData }

/**
 * Property Details Step Data Interface
 * FIX: Use shared PropertyDetailsData type from propertyForm.ts
 */
export type PropertyDetailsStepData = PropertyDetailsData

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
WHY: Enables useWizardStepSync pattern ...
 */
export interface ConfirmationStepData {
  acknowledged?: boolean
}

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