import { ref, type ComputedRef, type Ref } from 'vue'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import {
  useAppointmentSlots,
  useMinimizerPartsScheduling,
  type AvailabilityOrchestratorSlotComputeds,
  type AvailabilityOrchestratorMinimizerGates,
  type UseAvailabilityLogicReturn,
  type AvailabilityOrchestratorPostFetchPhaseResult,
} from '@/composables/booking/availabilityOrchestratorSlotsBundle'

export interface AvailabilityOrchestratorSlotsPhaseResult {
  appointmentSlots: ReturnType<typeof useAppointmentSlots>['appointmentSlots']
  appointmentShape: ReturnType<typeof useAppointmentSlots>['appointmentShape']
  selectedSlot: ReturnType<typeof useAppointmentSlots>['selectedSlot']
  graphBars: ReturnType<typeof useAppointmentSlots>['graphBars']
  confirmedMinimizerScheduling: Ref<MinimizerSchedulingOptions | null>
  minimizerPartsScheduling: ReturnType<typeof useMinimizerPartsScheduling>
  showMinimizerModal: Ref<boolean>
  minimizerOptions: ComputedRef<MinimizerSchedulingOptions | null>
  minimizerAppointmentSlots: ReturnType<typeof useMinimizerPartsScheduling>['minimizerAppointmentSlots']
  minimizerStepperDayLabel: ReturnType<typeof useMinimizerPartsScheduling>['minimizerStepperDayLabel']
  minimizerPartShapeName: ReturnType<typeof useMinimizerPartsScheduling>['minimizerPartShapeName']
  selectedMinimizerDay: Ref<string | null>
  setSelectedMinimizerDay: (date: string | null) => void
  allowedMinimizerDates: ReturnType<typeof useMinimizerPartsScheduling>['allowedMinimizerDates']
  availableMinimizerDayKeys: ReturnType<typeof useMinimizerPartsScheduling>['availableMinimizerDayKeys']
  minimizerFirstDayKey: ReturnType<typeof useMinimizerPartsScheduling>['minimizerFirstDayKey']
  minimizerLastDayKey: ReturnType<typeof useMinimizerPartsScheduling>['minimizerLastDayKey']
  minimizerSchedulingWindow: ReturnType<typeof useMinimizerPartsScheduling>['minimizerSchedulingWindow']
  isLoadingMinimizerDaySlots: Ref<boolean>
  selectedMinimizerSlotIndex: Ref<number | null>
  openMinimizerModal: () => void
  closeMinimizerModal: () => void
  selectMinimizerSlot: (index: number) => void
  isLoadingOptions: Ref<boolean>
}

export function setupAvailabilityOrchestratorSlotsPhase(input: {
  logic: Pick<UseAvailabilityLogicReturn, 'accumulatedBlockInstances' | 'isEffectivelyDifferential'>
  slotComputeds: Pick<AvailabilityOrchestratorSlotComputeds, 'deadlineFilteredSlotsForDay'>
  postFetch: Pick<AvailabilityOrchestratorPostFetchPhaseResult, 'selectedButtonIndex' | 'perspective'>
  minimizerGates: Pick<
    AvailabilityOrchestratorMinimizerGates,
    'contingencyPeriod' | 'appointmentShapeFromBlocks'
  >
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  computedAvailability: UseComputedAvailabilityReturn
}): AvailabilityOrchestratorSlotsPhaseResult {
  const { logic, slotComputeds, postFetch, minimizerGates, propertyDetailsStepData, computedAvailability } = input

  const { appointmentShape, appointmentSlots, selectedSlot, graphBars } = useAppointmentSlots({
    blockInstances: logic.accumulatedBlockInstances,
    serverSlotsForDay: slotComputeds.deadlineFilteredSlotsForDay,
    selectedButtonIndex: postFetch.selectedButtonIndex,
    perspective: postFetch.perspective,
    isDifferentialService: logic.isEffectivelyDifferential,
    appointmentShapeFromBlocks: minimizerGates.appointmentShapeFromBlocks,
  })

  const minimizerPartsScheduling = useMinimizerPartsScheduling({
    appointmentShape,
    selectedSlot,
    contingencyPeriod: minimizerGates.contingencyPeriod,
    propertyDetailsStepData,
    slotsByDay: computedAvailability.slotsByDay,
  })

  const {
    showModal: showMinimizerModal,
    minimizerOptions,
    minimizerAppointmentSlots,
    minimizerStepperDayLabel,
    minimizerPartShapeName,
    selectedMinimizerDay,
    setSelectedMinimizerDay,
    allowedMinimizerDates,
    availableMinimizerDayKeys,
    minimizerFirstDayKey,
    minimizerLastDayKey,
    minimizerSchedulingWindow,
    isLoadingMinimizerDaySlots,
    selectedSlotIndex: selectedMinimizerSlotIndex,
    openModal: openMinimizerModal,
    closeModal: closeMinimizerModal,
    selectSlot: selectMinimizerSlot,
    isLoadingOptions,
  } = minimizerPartsScheduling

  const confirmedMinimizerScheduling = ref<MinimizerSchedulingOptions | null>(null)

  return {
    appointmentSlots,
    appointmentShape,
    selectedSlot,
    graphBars,
    confirmedMinimizerScheduling,
    minimizerPartsScheduling,
    showMinimizerModal,
    minimizerOptions,
    minimizerAppointmentSlots,
    minimizerStepperDayLabel,
    minimizerPartShapeName,
    selectedMinimizerDay,
    setSelectedMinimizerDay,
    allowedMinimizerDates,
    availableMinimizerDayKeys,
    minimizerFirstDayKey,
    minimizerLastDayKey,
    minimizerSchedulingWindow,
    isLoadingMinimizerDaySlots,
    selectedMinimizerSlotIndex,
    openMinimizerModal,
    closeMinimizerModal,
    selectMinimizerSlot,
    isLoadingOptions,
  }
}
