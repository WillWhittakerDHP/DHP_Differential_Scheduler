import { computed, ref, watch, type ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import { toISO8601Date } from '@/utils/datetime'
import { getTodayDate } from '@/utils/time/timeFormatting'
import { useAvailabilityLogic } from '@/composables/booking/useAvailabilityLogic'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { useAvailabilityValidation } from '@/composables/booking/useAvailabilityValidation'
import { useAvailabilityStepData } from '@/composables/booking/useAvailabilityStepData'
import { useOptionTypeBlockSelection } from '@/composables/booking/useOptionTypeBlockSelection'
import { useAvailabilityUI } from '@/composables/booking/useAvailabilityUI'
import { useAvailabilityDefaults } from '@/composables/booking/useAvailabilityDefaults'
import { useMoveablePartsScheduling } from '@/composables/booking/useMoveablePartsScheduling'
import { useAppointmentDuration } from '@/composables/booking/useAppointmentDuration'
import { useMockCalendarRefresh } from '@/composables/booking/useMockCalendarRefresh'
import { usePerspectiveMapping } from '@/composables/booking/usePerspectiveMapping'
import { useAvailabilityStepHandlers } from '@/utils/booking/availabilityStepHandlers'
import { useAvailabilityDevPanel } from '@/composables/booking/useAvailabilityDevPanel'
import { useAvailabilityEmptyState } from '@/composables/booking/useAvailabilityEmptyState'
import { useAvailabilitySlotColor } from '@/composables/booking/useAvailabilitySlotColor'
import { isDifferentialFromSelectedBlocks } from '@/composables/booking/useAvailabilityLogic'
import { findMatchingTimeSlot } from '@/utils/booking/timeSlotMatching'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type {
  UseAvailabilityOrchestratorParams,
  UseAvailabilityOrchestratorReturn,
} from '@/types/booking/availabilityOrchestrator'


export function useAvailabilityOrchestrator(params: UseAvailabilityOrchestratorParams): UseAvailabilityOrchestratorReturn {
  const {
    wizard,
    loadedWizardState,
    computedAvailability,
    propertyDetailsStepData,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef,
    availabilityStepData
  } = params

  const timeSlotsWrapper = ref<ComputedRef<TimeSlot[]> | null>(null)
  const timeSlotsForDefaults = computed<TimeSlot[] | null>(() => {
    const wrapper = timeSlotsWrapper.value
    if (!wrapper || !('value' in wrapper)) return null
    return (wrapper as unknown as ComputedRef<TimeSlot[]>).value
  })
  const timeSlotsForLogic = computed<TimeSlot[]>(() => {
    const wrapper = timeSlotsWrapper.value
    if (!wrapper || !('value' in wrapper)) return []
    return (wrapper as unknown as ComputedRef<TimeSlot[]>).value
  })

  /** Use canonical differential derivation from useAvailabilityLogic (Phase 6.4). */
  const isEffectivelyDifferentialForDefaults = computed(() =>
    isDifferentialFromSelectedBlocks(wizard.selectedServiceTypeBlocks.value)
  )

  const {
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex
  } = useAvailabilityDefaults({
    loadedWizardState,
    timeSlots: timeSlotsForDefaults,
    isDifferentialService: isEffectivelyDifferentialForDefaults,
    restoreFrom: availabilityStepData
  })

  const today = new Date()
  const vDatePickerDisplayDate = ref<Date>(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))

  const {
    accumulatedBlockInstances,
    dateRangeForApi,
    selectedDateSingle,
    isEffectivelyDifferential
  } = useAvailabilityLogic({
    selectedDate,
    propertyDetailsStepData,
    wizard: {
      selectedUserTypeBlock: wizard.selectedUserTypeBlock,
      selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks
    },
    timeSlots: timeSlotsForLogic,
    loadedWizardState
  })

  const selectedDayKey = computed(() => {
    const start = selectedDate.value?.start
    return start ? (start.includes('T') ? start.split('T')[0] : start) : null
  })
  const serverSlotsForDay = computed(() => {
    const day = selectedDayKey.value
    if (!day) return []
    const raw = computedAvailability.slotsByDay.value.get(day)
    return raw !== undefined ? raw : []
  })
  const timeSlotsFromServer = computed<TimeSlot[]>(() =>
    serverSlotsForDay.value.map(s => ({
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      major: false,
      minor: false,
      moveable: false,
      isAvailable: s.isAvailable,
      flexibleViolations: s.violations
    }))
  )
  timeSlotsWrapper.value = timeSlotsFromServer

  const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    availableOptionTypeBlocks: wizard.availableOptionTypeBlocks
  })

  const { appointmentDuration } = useAppointmentDuration({ accumulatedBlockInstances })
  const { mockRefreshKey } = useMockCalendarRefresh()

  watch(vDatePickerDisplayDate, newDate => {
    if (!isNaN(newDate.getTime())) {
      const newMonth: DisplayedMonth = { year: newDate.getUTCFullYear(), month: newDate.getUTCMonth() }
      const currentMonth = displayedMonth.value
      if (currentMonth.year !== newMonth.year || currentMonth.month !== newMonth.month) {
        updateDisplayedMonth(newMonth)
      }
    }
  })

  watch(appointmentDuration, newDuration => {
    appointmentDurationRef.value = newDuration
  }, { immediate: true })

  watch(displayedMonth, newMonth => {
    const newDate = new Date(Date.UTC(newMonth.year, newMonth.month, 1))
    const currentDate = vDatePickerDisplayDate.value
    if (currentDate.getUTCFullYear() !== newMonth.year || currentDate.getUTCMonth() !== newMonth.month) {
      vDatePickerDisplayDate.value = newDate
    }
  }, { immediate: true })

  watch(selectedDate, newDate => {
    if (newDate?.start) {
      const date = new Date(newDate.start)
      if (!isNaN(date.getTime())) {
        updateDisplayedMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() })
      }
    }
  }, { immediate: true })

  const { perspective } = usePerspectiveMapping({ startTimeType })
  const selectedButtonIndex = computed(() => appointmentSlotOrderIndex.value)

  /** Index of the slot matching the loaded appointment's inspector time when rescheduling on the same day. */
  const originalInspectionButtonIndex = computed((): number | null => {
    if (wizard.wizardMode.value !== 'reschedule') return null
    const loaded = loadedWizardState.value?.availability
    const candidateDate = loaded?.candidateDate?.start
    const candidateSlots = loaded?.candidateTimeSlots
    if (!candidateDate || !candidateSlots?.length) return null
    const selectedStart = selectedDate.value?.start
    if (!selectedStart) return null
    const selectedDay = selectedStart.includes('T') ? selectedStart.split('T')[0] : selectedStart
    const candidateDay = candidateDate.includes('T') ? candidateDate.split('T')[0] : candidateDate
    if (selectedDay !== candidateDay) return null
    const inspectorTime = candidateSlots[0].time
    const slots = appointmentSlots.value
    const matched = findMatchingTimeSlot(inspectorTime, slots)
    return matched?.buttonIndex ?? null
  })

  const { slotColor, allowedDates, firstAvailableDate } = useAvailabilitySlotColor({
    startTimeType,
    slotsByDay: computedAvailability.slotsByDay
  })

  const firstAvailableNotice = ref<string | null>(null)
  watch(firstAvailableDate, firstDate => {
    if (!firstDate) return
    const today = getTodayDate()
    if (selectedDate.value.start !== today) return
    if (firstDate === today) {
      firstAvailableNotice.value = null
      return
    }
    selectedDate.value = { start: toISO8601Date(firstDate), end: null }
    const dateObj = new Date(firstDate + 'T00:00:00')
    firstAvailableNotice.value = `Today is fully booked. Showing ${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — the earliest date with available slots.`
  }, { immediate: true })

  const { appointmentShape, appointmentSlots, selectedSlot, graphBars } = useAppointmentSlots({
    blockInstances: accumulatedBlockInstances,
    serverSlotsForDay,
    selectedButtonIndex,
    perspective,
    isDifferentialService: isEffectivelyDifferential
  })

  const moveablePartsScheduling = useMoveablePartsScheduling({
    appointmentShape,
    selectedSlot,
    propertyDetailsStepData,
    slotsByDay: computedAvailability.slotsByDay,
  })
  const {
    hasMoveableParts,
    showModal: showMoveableModal,
    moveableOptions,
    moveableAppointmentSlots,
    moveablePartShapeName,
    selectedMoveableDay,
    setSelectedMoveableDay,
    allowedMoveableDates,
    isLoadingMoveableDaySlots,
    selectedSlotIndex: selectedMoveableSlotIndex,
    contingencyPeriod,
    openModal: openMoveableModal,
    closeModal: closeMoveableModal,
    selectSlot: selectMoveableSlot,
    isLoadingOptions,
  } = moveablePartsScheduling

  const hasMoveablePartsGated = computed(
    () =>
      hasMoveableParts.value &&
      wizard.selectedServiceTypeBlocks.value.some((b) => b.preClosing === true)
  )

  const confirmedMoveableScheduling = ref<typeof moveableOptions.value>(null)

  const { emptyStateMessage } = useAvailabilityEmptyState({
    isEffectivelyDifferential,
    startTimeType,
    appointmentSlotsCount: computed(() => appointmentSlots.value.length)
  })

  const { stepData } = useAvailabilityStepData({
    selectedDate,
    selectedSlot,
    moveableScheduling: computed(() => confirmedMoveableScheduling.value)
  })

  const { fieldErrors, isFormValid, validateForm } = useAvailabilityValidation({
    selectedDate,
    selectedSlot
  })

  const { handleDateChange } = useAvailabilityUI({
    selectedDate,
    selectedButtonIndex,
    fieldErrors
  })

  const userHasChosenTimeBasisFromGraph = ref(false)

  const {
    handleAppointmentSlotClick,
    handleMoveableConfirm,
    handleMoveableCancel,
    handleTimeBasisChange: handleTimeBasisChangeBase
  } = useAvailabilityStepHandlers({
    appointmentSlotOrderIndex,
    hasMoveableParts: hasMoveablePartsGated,
    selectedSlot,
    openMoveableModal,
    closeMoveableModal,
    moveableOptions,
    moveableSlotsForConfirm: moveablePartsScheduling.moveableSlotsForConfirm,
    selectedMoveableSlotIndex,
    confirmedMoveableScheduling,
    startTimeType
  })

  const handleTimeBasisChange = (type: 'major' | 'minor'): void => {
    userHasChosenTimeBasisFromGraph.value = true
    handleTimeBasisChangeBase(type)
  }

  useAvailabilityDevPanel({
    selectedBlockInstances: accumulatedBlockInstances,
    appointmentSlots,
    appointmentShape,
    selectedDate,
    selectedSlot,
    dateRange: dateRangeForApi,
    busyPeriods: computed(() => []),
    refreshKey: mockRefreshKey,
    isEffectivelyDifferential
  })

  const setVDatePickerDisplayDate = (val: Date): void => {
    vDatePickerDisplayDate.value = val
  }

  const clearFirstAvailableNotice = (): void => {
    firstAvailableNotice.value = null
  }

  return {
    data: {
      firstAvailableNotice,
      selectedDateSingle,
      vDatePickerDisplayDate,
      allowedDates,
      fieldErrors,
      isEffectivelyDifferential,
      userHasChosenTimeBasisFromGraph,
      graphBars,
      perspective,
      selectedDate,
      appointmentSlots,
      emptyStateMessage,
      selectedButtonIndex,
      originalInspectionButtonIndex,
      selectedOptionTypeBlockId,
      showMoveableModal,
      moveableOptions,
      moveableAppointmentSlots,
      moveablePartShapeName,
      selectedMoveableDay,
      setSelectedMoveableDay,
      allowedMoveableDates,
      isLoadingMoveableDaySlots,
      selectedMoveableSlotIndex,
      contingencyPeriod,
      isLoadingOptions,
      stepData,
      isFormValid,
      slotColor,
    },
    actions: {
      getTodayDate,
      setVDatePickerDisplayDate,
      handleDateChange,
      handleTimeBasisChange,
      handleAppointmentSlotClick,
      selectMoveableSlot,
      handleMoveableConfirm,
      handleMoveableCancel,
      validateForm,
      clearFirstAvailableNotice,
    },
    wizard,
  }
}
