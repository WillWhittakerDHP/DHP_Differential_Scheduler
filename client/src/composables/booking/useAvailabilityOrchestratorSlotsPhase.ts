import { ref, type ComputedRef, type Ref } from 'vue'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { useMoveablePartsScheduling } from '@/composables/booking/useMoveablePartsScheduling'
import type { AvailabilityOrchestratorSlotComputeds } from '@/composables/booking/useAvailabilityOrchestratorSlotComputeds'
import type { AvailabilityOrchestratorMoveableGates } from '@/composables/booking/useAvailabilityOrchestratorMoveableGates'
import type { UseAvailabilityLogicReturn } from '@/composables/booking/useAvailabilityLogic'
import type { AvailabilityOrchestratorPostFetchPhaseResult } from '@/composables/booking/useAvailabilityOrchestratorPostFetchPhase'

export interface AvailabilityOrchestratorSlotsPhaseResult {
  appointmentSlots: ReturnType<typeof useAppointmentSlots>['appointmentSlots']
  appointmentShape: ReturnType<typeof useAppointmentSlots>['appointmentShape']
  selectedSlot: ReturnType<typeof useAppointmentSlots>['selectedSlot']
  graphBars: ReturnType<typeof useAppointmentSlots>['graphBars']
  confirmedMoveableScheduling: Ref<MoveableSchedulingOptions | null>
  moveablePartsScheduling: ReturnType<typeof useMoveablePartsScheduling>
  showMoveableModal: Ref<boolean>
  moveableOptions: ComputedRef<MoveableSchedulingOptions | null>
  moveableAppointmentSlots: ReturnType<typeof useMoveablePartsScheduling>['moveableAppointmentSlots']
  moveableStepperDayLabel: ReturnType<typeof useMoveablePartsScheduling>['moveableStepperDayLabel']
  moveablePartShapeName: ReturnType<typeof useMoveablePartsScheduling>['moveablePartShapeName']
  selectedMoveableDay: Ref<string | null>
  setSelectedMoveableDay: (date: string | null) => void
  allowedMoveableDates: ReturnType<typeof useMoveablePartsScheduling>['allowedMoveableDates']
  availableMoveableDayKeys: ReturnType<typeof useMoveablePartsScheduling>['availableMoveableDayKeys']
  moveableFirstDayKey: ReturnType<typeof useMoveablePartsScheduling>['moveableFirstDayKey']
  moveableLastDayKey: ReturnType<typeof useMoveablePartsScheduling>['moveableLastDayKey']
  moveableSchedulingWindow: ReturnType<typeof useMoveablePartsScheduling>['moveableSchedulingWindow']
  isLoadingMoveableDaySlots: Ref<boolean>
  selectedMoveableSlotIndex: Ref<number | null>
  openMoveableModal: () => void
  closeMoveableModal: () => void
  selectMoveableSlot: (index: number) => void
  isLoadingOptions: Ref<boolean>
}

export function setupAvailabilityOrchestratorSlotsPhase(input: {
  logic: Pick<UseAvailabilityLogicReturn, 'accumulatedBlockInstances' | 'isEffectivelyDifferential'>
  slotComputeds: Pick<AvailabilityOrchestratorSlotComputeds, 'deadlineFilteredSlotsForDay'>
  postFetch: Pick<AvailabilityOrchestratorPostFetchPhaseResult, 'selectedButtonIndex' | 'perspective'>
  moveableGates: Pick<
    AvailabilityOrchestratorMoveableGates,
    'contingencyPeriod' | 'appointmentShapeFromBlocks'
  >
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  computedAvailability: UseComputedAvailabilityReturn
}): AvailabilityOrchestratorSlotsPhaseResult {
  const { logic, slotComputeds, postFetch, moveableGates, propertyDetailsStepData, computedAvailability } = input

  const { appointmentShape, appointmentSlots, selectedSlot, graphBars } = useAppointmentSlots({
    blockInstances: logic.accumulatedBlockInstances,
    serverSlotsForDay: slotComputeds.deadlineFilteredSlotsForDay,
    selectedButtonIndex: postFetch.selectedButtonIndex,
    perspective: postFetch.perspective,
    isDifferentialService: logic.isEffectivelyDifferential,
    appointmentShapeFromBlocks: moveableGates.appointmentShapeFromBlocks,
  })

  const moveablePartsScheduling = useMoveablePartsScheduling({
    appointmentShape,
    selectedSlot,
    contingencyPeriod: moveableGates.contingencyPeriod,
    propertyDetailsStepData,
    slotsByDay: computedAvailability.slotsByDay,
  })

  const {
    showModal: showMoveableModal,
    moveableOptions,
    moveableAppointmentSlots,
    moveableStepperDayLabel,
    moveablePartShapeName,
    selectedMoveableDay,
    setSelectedMoveableDay,
    allowedMoveableDates,
    availableMoveableDayKeys,
    moveableFirstDayKey,
    moveableLastDayKey,
    moveableSchedulingWindow,
    isLoadingMoveableDaySlots,
    selectedSlotIndex: selectedMoveableSlotIndex,
    openModal: openMoveableModal,
    closeModal: closeMoveableModal,
    selectSlot: selectMoveableSlot,
    isLoadingOptions,
  } = moveablePartsScheduling

  const confirmedMoveableScheduling = ref<typeof moveableOptions.value>(null)

  return {
    appointmentSlots,
    appointmentShape,
    selectedSlot,
    graphBars,
    confirmedMoveableScheduling,
    moveablePartsScheduling,
    showMoveableModal,
    moveableOptions,
    moveableAppointmentSlots,
    moveableStepperDayLabel,
    moveablePartShapeName,
    selectedMoveableDay,
    setSelectedMoveableDay,
    allowedMoveableDates,
    availableMoveableDayKeys,
    moveableFirstDayKey,
    moveableLastDayKey,
    moveableSchedulingWindow,
    isLoadingMoveableDaySlots,
    selectedMoveableSlotIndex,
    openMoveableModal,
    closeMoveableModal,
    selectMoveableSlot,
    isLoadingOptions,
  }
}
