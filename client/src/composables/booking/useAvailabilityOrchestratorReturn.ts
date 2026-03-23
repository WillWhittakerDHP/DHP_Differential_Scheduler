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
      hasMoveablePartsGated: bundle.hasMoveablePartsGated,
      userHasChosenTimeBasisFromGraph: bundle.userHasChosenTimeBasisFromGraph,
      graphBars: bundle.graphBars,
      perspective: bundle.perspective,
      selectedDate: bundle.selectedDate,
      appointmentSlots: bundle.appointmentSlots,
      emptyStateMessage: bundle.emptyStateMessage,
      selectedButtonIndex: bundle.selectedButtonIndex,
      originalInspectionButtonIndex: bundle.originalInspectionButtonIndex,
      selectedOptionTypeBlockId: bundle.selectedOptionTypeBlockId,
      showMoveableModal: bundle.showMoveableModal,
      moveableOptions: bundle.moveableOptions,
      moveableAppointmentSlots: bundle.moveableAppointmentSlots,
      moveableStepperDayLabel: bundle.moveableStepperDayLabel,
      moveablePartShapeName: bundle.moveablePartShapeName,
      selectedMoveableDay: bundle.selectedMoveableDay,
      setSelectedMoveableDay: bundle.setSelectedMoveableDay,
      allowedMoveableDates: bundle.allowedMoveableDates,
      availableMoveableDayKeys: bundle.availableMoveableDayKeys,
      moveableFirstDayKey: bundle.moveableFirstDayKey,
      moveableLastDayKey: bundle.moveableLastDayKey,
      moveableSchedulingWindow: bundle.moveableSchedulingWindow,
      isLoadingMoveableDaySlots: bundle.isLoadingMoveableDaySlots,
      selectedMoveableSlotIndex: bundle.selectedMoveableSlotIndex,
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
      selectMoveableSlot: bundle.selectMoveableSlot,
      handleMoveableConfirm: bundle.handleMoveableConfirm,
      handleMoveableCancel: bundle.handleMoveableCancel,
      validateForm: bundle.validateForm,
      clearFirstAvailableNotice: bundle.clearFirstAvailableNotice,
    },
    wizard: bundle.wizard,
  }
}
