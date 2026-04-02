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
  /** Array of selected line item blocks (wizardVisible: false) */
  selectedLineItemBlocks: BookingBlockInstance[]
  /** Array of selected coupon block (single-select UI, array storage; same pattern as property type) */
  selectedCouponBlocks: BookingBlockInstance[]
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
  /** Toggle coupon block selection (single-select UI, array storage; same as property type) */
  toggleCouponBlock: (block: BookingBlockInstance) => void
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
  /** Available coupon block instances (cascade from selected services; same routine as property type) */
  availableCouponBlocks: ComputedRef<BookingBlockInstance[]>
  /** Available line item blocks (wizardVisible: false) */
  availableLineItemBlocks: ComputedRef<BookingBlockInstance[]>
  
  /** Error messages for cascade filtering */
  servicesCascadeError: ComputedRef<string | null>
  availabilityOptionsCascadeError: ComputedRef<string | null>
  propertyTypesCascadeError: ComputedRef<string | null>
  couponCascadeError: ComputedRef<string | null>
  
  /** Accumulation computed properties for duration calculations */
  accServices: ComputedRef<BookingBlockInstance[]>
  accProperty: ComputedRef<BookingBlockInstance[]>
  accAvailability: ComputedRef<BookingBlockInstance[]>
}

/** Ref bundle for wizard selection state (shared by flat and grouped composable return shapes). */
export interface BookingWizardStateSlice {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  selectedLineItemBlocks: Ref<BookingBlockInstance[]>
  selectedCouponBlocks: Ref<BookingBlockInstance[]>
  isQuoteMode: Ref<boolean>
  wizardMode: Ref<WizardMode>
}

/** Flat shape provided/injected. isQuoteMode is a convenience derived from wizardMode (wizardMode === 'quote'). */
export type UseBookingWizardReturn = BookingWizardStateSlice &
  WizardSelectionMethods &
  WizardComputedProperties & {
    bookingData: ComputedRef<BookingData | null>
  }

/** Grouped return for composable-health (oversized-return repair). Tab spreads to flat when providing. */
export interface UseBookingWizardReturnGrouped {
  state: BookingWizardStateSlice
  actions: WizardSelectionMethods
  computed: WizardComputedProperties & { bookingData: ComputedRef<BookingData | null> }
}
