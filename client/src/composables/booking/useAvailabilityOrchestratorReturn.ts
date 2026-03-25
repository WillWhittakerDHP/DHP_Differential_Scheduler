import type { UseBookingWizardReturn } from '@/types/wizard'
import type { UseAvailabilityOrchestratorReturn } from '@/types/booking/availabilityOrchestrator'
import { getTodayDate } from '@/utils/time/timeFormatting'

/** Flat bundle passed into buildAvailabilityOrchestratorReturn; getTodayDate is injected in the builder, not passed on the bundle. */
type AvailabilityOrchestratorReturnBundle = UseAvailabilityOrchestratorReturn['data'] &
  Omit<UseAvailabilityOrchestratorReturn['actions'], 'getTodayDate'> & { wizard: UseBookingWizardReturn }

export function buildAvailabilityOrchestratorReturn(bundle: AvailabilityOrchestratorReturnBundle): UseAvailabilityOrchestratorReturn {
  return {
    data: {
      firstAvailableNotice: bundle.firstAvailableNotice,
      selectedDateSingle: bundle.selectedDateSingle,
      vDatePickerDisplayDate: bundle.vDatePickerDisplayDate,
      allowedDates: bundle.allowedDates,
      fieldErrors: bundle.fieldErrors,
      isEffectivelyDifferential: bundle.isEffectivelyDifferential,
      hasMinimizerPartsGated: bundle.hasMinimizerPartsGated,
      userHasChosenTimeBasisFromGraph: bundle.userHasChosenTimeBasisFromGraph,
      graphBars: bundle.graphBars,
      perspective: bundle.perspective,
      selectedDate: bundle.selectedDate,
      appointmentSlots: bundle.appointmentSlots,
      emptyStateMessage: bundle.emptyStateMessage,
      selectedButtonIndex: bundle.selectedButtonIndex,
      originalInspectionButtonIndex: bundle.originalInspectionButtonIndex,
      selectedOptionTypeBlockId: bundle.selectedOptionTypeBlockId,
      showMinimizerModal: bundle.showMinimizerModal,
      minimizerOptions: bundle.minimizerOptions,
      minimizerAppointmentSlots: bundle.minimizerAppointmentSlots,
      minimizerStepperDayLabel: bundle.minimizerStepperDayLabel,
      minimizerPartShapeName: bundle.minimizerPartShapeName,
      selectedMinimizerDay: bundle.selectedMinimizerDay,
      setSelectedMinimizerDay: bundle.setSelectedMinimizerDay,
      allowedMinimizerDates: bundle.allowedMinimizerDates,
      availableMinimizerDayKeys: bundle.availableMinimizerDayKeys,
      minimizerFirstDayKey: bundle.minimizerFirstDayKey,
      minimizerLastDayKey: bundle.minimizerLastDayKey,
      minimizerSchedulingWindow: bundle.minimizerSchedulingWindow,
      isLoadingMinimizerDaySlots: bundle.isLoadingMinimizerDaySlots,
      selectedMinimizerSlotIndex: bundle.selectedMinimizerSlotIndex,
      contingencyPeriod: bundle.contingencyPeriod,
      isLoadingOptions: bundle.isLoadingOptions,
      stepData: bundle.stepData,
      isFormValid: bundle.isFormValid,
      slotColor: bundle.slotColor,
      availabilityMinuteIncrement: bundle.availabilityMinuteIncrement,
    },
    actions: {
      getTodayDate,
      setVDatePickerDisplayDate: bundle.setVDatePickerDisplayDate,
      handleDateChange: bundle.handleDateChange,
      handleTimeBasisChange: bundle.handleTimeBasisChange,
      handleAppointmentSlotClick: bundle.handleAppointmentSlotClick,
      selectMinimizerSlot: bundle.selectMinimizerSlot,
      handleMinimizerConfirm: bundle.handleMinimizerConfirm,
      handleMinimizerCancel: bundle.handleMinimizerCancel,
      validateForm: bundle.validateForm,
      clearFirstAvailableNotice: bundle.clearFirstAvailableNotice,
    },
    wizard: bundle.wizard,
  }
}
