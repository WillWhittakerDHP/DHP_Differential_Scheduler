import { computed, ref, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { UsePerspectiveMappingParams } from '@/types/booking/perspectiveMapping'
import { useAvailabilityStepHandlers } from '@/utils/booking/availabilityStepHandlers'
import {
  useAvailabilityUI,
  useAvailabilityDevPanel,
  type UseAvailabilityLogicReturn,
  type AvailabilityOrchestratorPostFetchPhaseResult,
  type AvailabilityOrchestratorSlotsPhaseResult,
  type AvailabilityOrchestratorFormsPhaseResult,
  type AvailabilityOrchestratorMinimizerGates,
} from '@/composables/booking/availabilityOrchestratorActionsBundle'

interface AvailabilityOrchestratorActionsPhaseResult {
  userHasChosenTimeBasisFromGraph: Ref<boolean>
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
  handleTimeBasisChange: (type: 'major' | 'minor') => void
  handleAppointmentSlotClick: ReturnType<typeof useAvailabilityStepHandlers>['handleAppointmentSlotClick']
  selectMinimizerSlot: AvailabilityOrchestratorSlotsPhaseResult['selectMinimizerSlot']
  handleMinimizerConfirm: ReturnType<typeof useAvailabilityStepHandlers>['handleMinimizerConfirm']
  handleMinimizerCancel: ReturnType<typeof useAvailabilityStepHandlers>['handleMinimizerCancel']
}

export function useAvailabilityOrchestratorActionsPhase(input: {
  logic: Pick<UseAvailabilityLogicReturn, 'accumulatedBlockInstances' | 'dateRangeForApi' | 'isEffectivelyDifferential'>
  postFetch: Pick<AvailabilityOrchestratorPostFetchPhaseResult, 'mockRefreshKey'>
  slotsPhase: Pick<
    AvailabilityOrchestratorSlotsPhaseResult,
    | 'appointmentSlots'
    | 'appointmentShape'
    | 'selectedSlot'
    | 'openMinimizerModal'
    | 'closeMinimizerModal'
    | 'minimizerOptions'
    | 'minimizerPartsScheduling'
    | 'selectedMinimizerSlotIndex'
    | 'confirmedMinimizerScheduling'
    | 'selectMinimizerSlot'
    | 'minimizerSchedulingWindow'
  >
  formsPhase: Pick<AvailabilityOrchestratorFormsPhaseResult, 'fieldErrors'>
  minimizerGates: Pick<AvailabilityOrchestratorMinimizerGates, 'hasMinimizerPartsGated'>
  selectedDate: UseAvailabilityUIParams['selectedDate']
  startTimeType: UsePerspectiveMappingParams['startTimeType']
  appointmentSlotOrderIndex: Ref<number | null>
  firstAvailableNotice: Ref<string | null>
}): AvailabilityOrchestratorActionsPhaseResult {
  const {
    logic,
    postFetch,
    slotsPhase,
    formsPhase,
    minimizerGates,
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex,
    firstAvailableNotice,
  } = input

  const userHasChosenTimeBasisFromGraph = ref(false)

  const { handleDateChange: handleDateChangeBase } = useAvailabilityUI({
    selectedDate,
    selectedButtonIndex: appointmentSlotOrderIndex,
    fieldErrors: formsPhase.fieldErrors,
  })

  const handleDateChange = (value: string | Date | string[] | Date[] | null): void => {
    firstAvailableNotice.value = null
    handleDateChangeBase(value)
  }

  const {
    handleAppointmentSlotClick,
    handleMinimizerConfirm,
    handleMinimizerCancel,
    handleTimeBasisChange: handleTimeBasisChangeBase,
  } = useAvailabilityStepHandlers({
    appointmentSlotOrderIndex,
    hasMinimizerParts: minimizerGates.hasMinimizerPartsGated,
    selectedSlot: slotsPhase.selectedSlot,
    openMinimizerModal: slotsPhase.openMinimizerModal,
    closeMinimizerModal: slotsPhase.closeMinimizerModal,
    minimizerOptions: slotsPhase.minimizerOptions,
    minimizerSlotsForConfirm: slotsPhase.minimizerPartsScheduling.minimizerSlotsForConfirm,
    selectedMinimizerSlotIndex: slotsPhase.selectedMinimizerSlotIndex,
    confirmedMinimizerScheduling: slotsPhase.confirmedMinimizerScheduling,
    startTimeType,
  })

  const handleTimeBasisChange = (type: 'major' | 'minor'): void => {
    userHasChosenTimeBasisFromGraph.value = true
    handleTimeBasisChangeBase(type)
  }

  useAvailabilityDevPanel({
    selectedBlockInstances: logic.accumulatedBlockInstances,
    appointmentSlots: slotsPhase.appointmentSlots,
    appointmentShape: slotsPhase.appointmentShape,
    selectedDate,
    selectedSlot: slotsPhase.selectedSlot,
    dateRange: logic.dateRangeForApi,
    busyPeriods: computed(() => []),
    refreshKey: postFetch.mockRefreshKey,
    isEffectivelyDifferential: logic.isEffectivelyDifferential,
    minimizerSchedulingWindow: slotsPhase.minimizerSchedulingWindow,
  })

  return {
    userHasChosenTimeBasisFromGraph,
    handleDateChange,
    handleTimeBasisChange,
    handleAppointmentSlotClick,
    selectMinimizerSlot: slotsPhase.selectMinimizerSlot,
    handleMinimizerConfirm,
    handleMinimizerCancel,
  }
}
