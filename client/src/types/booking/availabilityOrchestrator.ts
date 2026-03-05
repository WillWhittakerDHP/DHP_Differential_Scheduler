import type { Ref, ComputedRef, WritableComputedRef } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { AppointmentSlots } from '@/types/appointment'
import type { MoveableSchedulingOptions, ContingencyPeriod } from '@/types/moveableScheduling'
import type { TimeRange } from '@/types/appointment'
import type { PerspectiveKey } from '@/types/appointment'

/** Grouped return for composable-health (oversized-return repair). Consumer may spread to flat. */
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'

export interface UseAvailabilityOrchestratorReturn {
  data: {
    firstAvailableNotice: Ref<string | null>
    selectedDateSingle: ComputedRef<string | null>
    vDatePickerDisplayDate: Ref<Date>
    allowedDates: ComputedRef<(date: string) => boolean>
    fieldErrors: Ref<Record<string, string>>
    isEffectivelyDifferential: ComputedRef<boolean>
    userHasChosenTimeBasisFromGraph: Ref<boolean>
    graphBars: ComputedRef<{ major: TimeRange | null; minor: TimeRange | null }>
    perspective: ComputedRef<PerspectiveKey>
    selectedDate: Ref<{ start: string | null; end: string | null }>
    appointmentSlots: ComputedRef<AppointmentSlots>
    emptyStateMessage: ComputedRef<string | null>
    selectedButtonIndex: ComputedRef<number | null>
    selectedOptionTypeBlockId: WritableComputedRef<string | null>
    showMoveableModal: Ref<boolean>
    /** True when selected slot has moveable parts and service has preClosing (gate for step 5 visibility). */
    hasMoveablePartsGated: ComputedRef<boolean>
    moveableOptions: ComputedRef<MoveableSchedulingOptions | null>
    moveableAppointmentSlots: ComputedRef<AppointmentSlots>
    moveablePartShapeName: ComputedRef<string>
    selectedMoveableDay: Ref<string | null>
    setSelectedMoveableDay: (date: string | null) => void
    allowedMoveableDates: ComputedRef<(date: unknown) => boolean>
    isLoadingMoveableDaySlots: Ref<boolean>
    selectedMoveableSlotIndex: Ref<number | null>
    contingencyPeriod: Ref<ContingencyPeriod>
    isLoadingOptions: Ref<boolean>
    stepData: ComputedRef<AvailabilityStepData>
    isFormValid: ComputedRef<boolean>
    slotColor: ComputedRef<'primary' | 'secondary'>
  }
  actions: {
    getTodayDate: () => string
    setVDatePickerDisplayDate: (val: Date) => void
    handleDateChange: (date: string | null) => void
    handleTimeBasisChange: (basis: 'major' | 'minor') => void
    handleAppointmentSlotClick: (index: number) => void
    selectMoveableSlot: (index: number) => void
    handleMoveableConfirm: () => void
    handleMoveableCancel: () => void
    validateForm: () => boolean
    clearFirstAvailableNotice: () => void
  }
  wizard: UseBookingWizardReturn
}

export interface UseAvailabilityOrchestratorParams {
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  computedAvailability: UseComputedAvailabilityReturn
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
}
