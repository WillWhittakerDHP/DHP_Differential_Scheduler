import type { Ref, ComputedRef, WritableComputedRef } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { AppointmentSlots } from '@/types/appointment'
import type { MinimizerSchedulingOptions, ContingencyPeriod } from '@/types/minimizerScheduling'
import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { PerspectiveKey } from '@/types/appointment'

/** Grouped return for composable-health (oversized-return repair). Consumer may spread to flat. */
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'

/**
 * Wiring shared by availability step injections and orchestrator (type-similarity REVIEW → EXTEND).
 * Step SFC injects this plus `isBookingFlowReady`; orchestrator adds optional `availabilityStepData` for restore.
 */
export interface AvailabilityStepOrchestratorContext {
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  computedAvailability: UseComputedAvailabilityReturn
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
}

export interface UseAvailabilityOrchestratorReturn {
  data: {
    firstAvailableNotice: Ref<string | null>
    selectedDateSingle: ComputedRef<string | null>
    vDatePickerDisplayDate: Ref<Date>
    allowedDates: ComputedRef<(date: string) => boolean>
    fieldErrors: Ref<Record<string, string>>
    isEffectivelyDifferential: ComputedRef<boolean>
    hasMinimizerPartsGated: ComputedRef<boolean>
    userHasChosenTimeBasisFromGraph: Ref<boolean>
    graphBars: ComputedRef<{ major: SlotTimeBounds | null; minor: SlotTimeBounds | null }>
    perspective: ComputedRef<PerspectiveKey>
    selectedDate: Ref<{ start: string | null; end: string | null }>
    appointmentSlots: ComputedRef<AppointmentSlots>
    emptyStateMessage: ComputedRef<string | null>
    selectedButtonIndex: ComputedRef<number | null>
    originalInspectionButtonIndex: ComputedRef<number | null>
    selectedOptionTypeBlockId: WritableComputedRef<string | null>
    showMinimizerModal: Ref<boolean>
    minimizerOptions: ComputedRef<MinimizerSchedulingOptions | null>
    minimizerAppointmentSlots: ComputedRef<AppointmentSlots>
    minimizerStepperDayLabel: ComputedRef<string>
    minimizerPartShapeName: ComputedRef<string>
    selectedMinimizerDay: Ref<string | null>
    setSelectedMinimizerDay: (date: string | null) => void
    allowedMinimizerDates: ComputedRef<(date: unknown) => boolean>
    availableMinimizerDayKeys: ComputedRef<string[]>
    minimizerFirstDayKey: ComputedRef<string | null>
    minimizerLastDayKey: ComputedRef<string | null>
    minimizerSchedulingWindow: ComputedRef<MinimizerSchedulingWindow | null>
    isLoadingMinimizerDaySlots: Ref<boolean>
    selectedMinimizerSlotIndex: Ref<number | null>
    contingencyPeriod: Ref<ContingencyPeriod>
    isLoadingOptions: Ref<boolean>
    stepData: ComputedRef<AvailabilityStepData>
    isFormValid: ComputedRef<boolean>
    slotColor: ComputedRef<'primary' | 'secondary'>
    /** Admin slot grid minute increment from computed availability API (native time `step` = minutes × 60 seconds). */
    availabilityMinuteIncrement: ComputedRef<number>
  }
  actions: {
    getTodayDate: () => string
    setVDatePickerDisplayDate: (val: Date) => void
    handleDateChange: (date: string | Date | string[] | Date[] | null) => void
    handleTimeBasisChange: (basis: 'major' | 'minor') => void
    handleAppointmentSlotClick: (index: number) => void
    selectMinimizerSlot: (index: number) => void
    handleMinimizerConfirm: () => void
    handleMinimizerCancel: () => void
    validateForm: () => boolean
    clearFirstAvailableNotice: () => void
  }
  wizard: UseBookingWizardReturn
}

export interface UseAvailabilityOrchestratorParams extends AvailabilityStepOrchestratorContext {
  /** Parent step data for restore when returning to step (wizard persistence). */
  availabilityStepData?: Ref<AvailabilityStepData | null>
}
