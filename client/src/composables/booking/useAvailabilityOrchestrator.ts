import type {
  UseAvailabilityOrchestratorParams,
  UseAvailabilityOrchestratorReturn,
} from '@/types/booking/availabilityOrchestrator'
import { createAvailabilityOrchestratorTimeSlotsShell } from '@/composables/booking/useAvailabilityOrchestratorTimeSlotsShell'
import { setupAvailabilityOrchestratorDefaultsPhase } from '@/composables/booking/useAvailabilityOrchestratorDefaultsPhase'
import { useAvailabilityOrchestratorLogicPhase } from '@/composables/booking/useAvailabilityOrchestratorLogicPhase'
import { setupAvailabilityOrchestratorMinimizerGates } from '@/composables/booking/useAvailabilityOrchestratorMinimizerGates'
import { createAvailabilityOrchestratorSlotComputeds } from '@/composables/booking/useAvailabilityOrchestratorSlotComputeds'
import { setupAvailabilityOrchestratorPostFetchPhase } from '@/composables/booking/useAvailabilityOrchestratorPostFetchPhase'
import { setupAvailabilityOrchestratorSlotsPhase } from '@/composables/booking/useAvailabilityOrchestratorSlotsPhase'
import { createOriginalInspectionButtonIndexComputed } from '@/composables/booking/useAvailabilityOrchestratorOriginalInspectionIndex'
import { setupAvailabilityOrchestratorFormsPhase } from '@/composables/booking/useAvailabilityOrchestratorFormsPhase'
import { useAvailabilityOrchestratorActionsPhase } from '@/composables/booking/useAvailabilityOrchestratorActionsPhase'
import { buildAvailabilityOrchestratorReturn } from '@/composables/booking/useAvailabilityOrchestratorReturn'

export function useAvailabilityOrchestrator(
  params: UseAvailabilityOrchestratorParams
): UseAvailabilityOrchestratorReturn {
  const {
    wizard,
    loadedWizardState,
    computedAvailability,
    propertyDetailsStepData,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef,
    availabilityStepData,
  } = params

  const shell = createAvailabilityOrchestratorTimeSlotsShell()
  const defaults = setupAvailabilityOrchestratorDefaultsPhase({
    loadedWizardState,
    availabilityStepData,
    wizard,
    shell,
  })

  const logic = useAvailabilityOrchestratorLogicPhase({
    selectedDate: defaults.selectedDate,
    propertyDetailsStepData,
    wizard,
    loadedWizardState,
    shell,
  })

  const minimizerGates = setupAvailabilityOrchestratorMinimizerGates({
    accumulatedBlockInstances: logic.accumulatedBlockInstances,
    wizard,
  })

  const slotComputeds = createAvailabilityOrchestratorSlotComputeds({
    selectedDate: defaults.selectedDate,
    slotsByDay: computedAvailability.slotsByDay,
    hasMinimizerPartsGated: minimizerGates.hasMinimizerPartsGated,
    contingencyPeriod: minimizerGates.contingencyPeriod,
    minimizerRoundedMinutes: minimizerGates.minimizerRoundedDurationForInspectionFilter,
    afterBufferMinutes: minimizerGates.afterBufferMinutesForInspectionFilter,
  })

  const postFetch = setupAvailabilityOrchestratorPostFetchPhase({
    shell,
    slotComputeds,
    computedAvailability,
    wizard,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef,
    vDatePickerDisplayDate: logic.vDatePickerDisplayDate,
    selectedDate: defaults.selectedDate,
    startTimeType: defaults.startTimeType,
    appointmentSlotOrderIndex: defaults.appointmentSlotOrderIndex,
    accumulatedBlockInstances: logic.accumulatedBlockInstances,
  })

  const slotsPhase = setupAvailabilityOrchestratorSlotsPhase({
    logic,
    slotComputeds,
    postFetch,
    minimizerGates,
    propertyDetailsStepData,
    computedAvailability,
  })

  const originalInspectionButtonIndex = createOriginalInspectionButtonIndexComputed({
    wizardMode: wizard.wizardMode,
    loadedWizardState,
    selectedDate: defaults.selectedDate,
    appointmentSlots: slotsPhase.appointmentSlots,
  })

  const formsPhase = setupAvailabilityOrchestratorFormsPhase({
    isEffectivelyDifferential: logic.isEffectivelyDifferential,
    startTimeType: defaults.startTimeType,
    appointmentSlots: slotsPhase.appointmentSlots,
    selectedDate: defaults.selectedDate,
    selectedSlot: slotsPhase.selectedSlot,
    confirmedMinimizerScheduling: slotsPhase.confirmedMinimizerScheduling,
    hasMinimizerPartsGated: minimizerGates.hasMinimizerPartsGated,
  })

  const actionsPhase = useAvailabilityOrchestratorActionsPhase({
    logic,
    postFetch,
    slotsPhase,
    formsPhase,
    minimizerGates,
    selectedDate: defaults.selectedDate,
    startTimeType: defaults.startTimeType,
    appointmentSlotOrderIndex: defaults.appointmentSlotOrderIndex,
    firstAvailableNotice: postFetch.firstAvailableNotice,
  })

  return buildAvailabilityOrchestratorReturn({
    firstAvailableNotice: postFetch.firstAvailableNotice,
    selectedDateSingle: logic.selectedDateSingle,
    vDatePickerDisplayDate: logic.vDatePickerDisplayDate,
    allowedDates: postFetch.allowedDates,
    fieldErrors: formsPhase.fieldErrors,
    isEffectivelyDifferential: logic.isEffectivelyDifferential,
    hasMinimizerPartsGated: minimizerGates.hasMinimizerPartsGated,
    userHasChosenTimeBasisFromGraph: actionsPhase.userHasChosenTimeBasisFromGraph,
    graphBars: slotsPhase.graphBars,
    perspective: postFetch.perspective,
    selectedDate: defaults.selectedDate,
    appointmentSlots: slotsPhase.appointmentSlots,
    emptyStateMessage: formsPhase.emptyStateMessage,
    selectedButtonIndex: postFetch.selectedButtonIndex,
    originalInspectionButtonIndex,
    selectedOptionTypeBlockId: postFetch.selectedOptionTypeBlockId,
    showMinimizerModal: slotsPhase.showMinimizerModal,
    minimizerOptions: slotsPhase.minimizerOptions,
    minimizerAppointmentSlots: slotsPhase.minimizerAppointmentSlots,
    minimizerStepperDayLabel: slotsPhase.minimizerStepperDayLabel,
    minimizerPartShapeName: slotsPhase.minimizerPartShapeName,
    selectedMinimizerDay: slotsPhase.selectedMinimizerDay,
    setSelectedMinimizerDay: slotsPhase.setSelectedMinimizerDay,
    allowedMinimizerDates: slotsPhase.allowedMinimizerDates,
    availableMinimizerDayKeys: slotsPhase.availableMinimizerDayKeys,
    minimizerFirstDayKey: slotsPhase.minimizerFirstDayKey,
    minimizerLastDayKey: slotsPhase.minimizerLastDayKey,
    minimizerSchedulingWindow: slotsPhase.minimizerSchedulingWindow,
    isLoadingMinimizerDaySlots: slotsPhase.isLoadingMinimizerDaySlots,
    selectedMinimizerSlotIndex: slotsPhase.selectedMinimizerSlotIndex,
    contingencyPeriod: minimizerGates.contingencyPeriod,
    isLoadingOptions: slotsPhase.isLoadingOptions,
    stepData: formsPhase.stepData,
    isFormValid: formsPhase.isFormValid,
    slotColor: postFetch.slotColor,
    availabilityMinuteIncrement: postFetch.availabilityMinuteIncrement,
    setVDatePickerDisplayDate: (val) => {
      logic.vDatePickerDisplayDate.value = val
    },
    handleDateChange: actionsPhase.handleDateChange,
    handleTimeBasisChange: actionsPhase.handleTimeBasisChange,
    handleAppointmentSlotClick: actionsPhase.handleAppointmentSlotClick,
    selectMinimizerSlot: actionsPhase.selectMinimizerSlot,
    handleMinimizerConfirm: actionsPhase.handleMinimizerConfirm,
    handleMinimizerCancel: actionsPhase.handleMinimizerCancel,
    validateForm: formsPhase.validateForm,
    clearFirstAvailableNotice: () => {
      postFetch.firstAvailableNotice.value = null
    },
    wizard,
  })
}
