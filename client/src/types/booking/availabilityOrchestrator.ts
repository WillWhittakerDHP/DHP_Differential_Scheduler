import type { Ref, ComputedRef } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

/** Grouped return for composable-health (oversized-return repair). Consumer may spread to flat. */
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
export interface UseAvailabilityOrchestratorReturn {
  data: {
    firstAvailableNotice: Ref<string | null>
    selectedDateSingle: ComputedRef<{ start: string; end: string | null } | null>
    vDatePickerDisplayDate: Ref<Date>
    allowedDates: ComputedRef<(date: string) => boolean>
    fieldErrors: ComputedRef<Record<string, string>>
    isEffectivelyDifferential: ComputedRef<boolean>
    userHasChosenTimeBasisFromGraph: Ref<boolean>
    graphBars: unknown
    perspective: ComputedRef<unknown>
    selectedDate: ComputedRef<{ start: string; end: string | null }>
    appointmentSlots: ComputedRef<unknown[]>
    emptyStateMessage: ComputedRef<string>
    selectedButtonIndex: ComputedRef<number>
    selectedOptionTypeBlockId: ComputedRef<string | null>
    showMoveableModal: Ref<boolean>
    moveableOptions: ComputedRef<unknown>
    selectedMoveableSlotIndex: Ref<number | null>
    contingencyPeriod: Ref<unknown>
    isLoadingOptions: Ref<boolean>
    stepData: ComputedRef<unknown>
    isFormValid: ComputedRef<boolean>
    slotColor: ComputedRef<string>
  }
  actions: {
    getTodayDate: () => string
    setVDatePickerDisplayDate: (val: Date) => void
    handleDateChange: (date: string | null) => void
    handleTimeBasisChange: (basis: string) => void
    handleAppointmentSlotClick: (index: number) => void
    selectMoveableSlot: (index: number) => void
    handleMoveableConfirm: () => void
    handleMoveableCancel: () => void
    validateForm: () => Promise<void>
    clearFirstAvailableNotice: () => void
  }
  wizard: UseBookingWizardReturn
}

export interface UseAvailabilityOrchestratorParams {
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  computedAvailability: UseComputedAvailabilityReturn
  propertyDetailsStepData: Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown } | null>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
}
