import type { Ref, ComputedRef, WritableComputedRef } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { AppointmentSlots } from '@/types/appointment'
import type { MoveableSchedulingOptions, ContingencyPeriod } from '@/types/moveableScheduling'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { PerspectiveKey } from '@/types/appointment'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type { UseAvailabilityOrchestratorReturn } from '@/types/booking/availabilityOrchestrator'
import { getTodayDate } from '@/utils/time/timeFormatting'

export interface AvailabilityOrchestratorReturnBundle {
  firstAvailableNotice: Ref<string | null>
  selectedDateSingle: ComputedRef<string | null>
  vDatePickerDisplayDate: Ref<Date>
  allowedDates: ComputedRef<(date: string) => boolean>
  fieldErrors: Ref<Record<string, string>>
  isEffectivelyDifferential: ComputedRef<boolean>
  hasMoveablePartsGated: ComputedRef<boolean>
  userHasChosenTimeBasisFromGraph: Ref<boolean>
  graphBars: ComputedRef<{ major: SlotTimeBounds | null; minor: SlotTimeBounds | null }>
  perspective: ComputedRef<PerspectiveKey>
  selectedDate: Ref<{ start: string | null; end: string | null }>
  appointmentSlots: ComputedRef<AppointmentSlots>
  emptyStateMessage: ComputedRef<string | null>
  selectedButtonIndex: ComputedRef<number | null>
  originalInspectionButtonIndex: ComputedRef<number | null>
  selectedOptionTypeBlockId: WritableComputedRef<string | null>
  showMoveableModal: Ref<boolean>
  moveableOptions: ComputedRef<MoveableSchedulingOptions | null>
  moveableAppointmentSlots: ComputedRef<AppointmentSlots>
  moveableStepperDayLabel: ComputedRef<string>
  moveablePartShapeName: ComputedRef<string>
  selectedMoveableDay: Ref<string | null>
  setSelectedMoveableDay: (date: string | null) => void
  allowedMoveableDates: ComputedRef<(date: unknown) => boolean>
  availableMoveableDayKeys: ComputedRef<string[]>
  moveableFirstDayKey: ComputedRef<string | null>
  moveableLastDayKey: ComputedRef<string | null>
  moveableSchedulingWindow: ComputedRef<MoveableSchedulingWindow | null>
  isLoadingMoveableDaySlots: Ref<boolean>
  selectedMoveableSlotIndex: Ref<number | null>
  contingencyPeriod: Ref<ContingencyPeriod>
  isLoadingOptions: Ref<boolean>
  stepData: ComputedRef<AvailabilityStepData>
  isFormValid: ComputedRef<boolean>
  slotColor: ComputedRef<'primary' | 'secondary'>
  availabilityMinuteIncrement: ComputedRef<number>
  setVDatePickerDisplayDate: (val: Date) => void
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
  handleTimeBasisChange: (type: 'major' | 'minor') => void
  handleAppointmentSlotClick: (index: number) => void
  selectMoveableSlot: (index: number) => void
  handleMoveableConfirm: () => void
  handleMoveableCancel: () => void
  validateForm: () => boolean
  clearFirstAvailableNotice: () => void
  wizard: UseBookingWizardReturn
}

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
