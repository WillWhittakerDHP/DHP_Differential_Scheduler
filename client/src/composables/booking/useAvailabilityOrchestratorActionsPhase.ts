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
  type AvailabilityOrchestratorMoveableGates,
} from '@/composables/booking/availabilityOrchestratorActionsBundle'

interface AvailabilityOrchestratorActionsPhaseResult {
  userHasChosenTimeBasisFromGraph: Ref<boolean>
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
  handleTimeBasisChange: (type: 'major' | 'minor') => void
  handleAppointmentSlotClick: ReturnType<typeof useAvailabilityStepHandlers>['handleAppointmentSlotClick']
  selectMoveableSlot: AvailabilityOrchestratorSlotsPhaseResult['selectMoveableSlot']
  handleMoveableConfirm: ReturnType<typeof useAvailabilityStepHandlers>['handleMoveableConfirm']
  handleMoveableCancel: ReturnType<typeof useAvailabilityStepHandlers>['handleMoveableCancel']
}

export function useAvailabilityOrchestratorActionsPhase(input: {
  logic: Pick<UseAvailabilityLogicReturn, 'accumulatedBlockInstances' | 'dateRangeForApi' | 'isEffectivelyDifferential'>
  postFetch: Pick<AvailabilityOrchestratorPostFetchPhaseResult, 'mockRefreshKey'>
  slotsPhase: Pick<
    AvailabilityOrchestratorSlotsPhaseResult,
    | 'appointmentSlots'
    | 'appointmentShape'
    | 'selectedSlot'
    | 'openMoveableModal'
    | 'closeMoveableModal'
    | 'moveableOptions'
    | 'moveablePartsScheduling'
    | 'selectedMoveableSlotIndex'
    | 'confirmedMoveableScheduling'
    | 'selectMoveableSlot'
    | 'moveableSchedulingWindow'
  >
  formsPhase: Pick<AvailabilityOrchestratorFormsPhaseResult, 'fieldErrors'>
  moveableGates: Pick<AvailabilityOrchestratorMoveableGates, 'hasMoveablePartsGated'>
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
    moveableGates,
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
    handleMoveableConfirm,
    handleMoveableCancel,
    handleTimeBasisChange: handleTimeBasisChangeBase,
  } = useAvailabilityStepHandlers({
    appointmentSlotOrderIndex,
    hasMoveableParts: moveableGates.hasMoveablePartsGated,
    selectedSlot: slotsPhase.selectedSlot,
    openMoveableModal: slotsPhase.openMoveableModal,
    closeMoveableModal: slotsPhase.closeMoveableModal,
    moveableOptions: slotsPhase.moveableOptions,
    moveableSlotsForConfirm: slotsPhase.moveablePartsScheduling.moveableSlotsForConfirm,
    selectedMoveableSlotIndex: slotsPhase.selectedMoveableSlotIndex,
    confirmedMoveableScheduling: slotsPhase.confirmedMoveableScheduling,
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
    moveableSchedulingWindow: slotsPhase.moveableSchedulingWindow,
  })

  return {
    userHasChosenTimeBasisFromGraph,
    handleDateChange,
    handleTimeBasisChange,
    handleAppointmentSlotClick,
    selectMoveableSlot: slotsPhase.selectMoveableSlot,
    handleMoveableConfirm,
    handleMoveableCancel,
  }
}
