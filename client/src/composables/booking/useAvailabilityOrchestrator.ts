/**
 * useAvailabilityOrchestrator
 *
 * Encapsulates all availability step logic: circular dependency resolution, watchers, and child composables.
 * AvailabilityStep injects refs, calls this once, and uses the return in template + useWizardStepSync.
 */

import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import type { DisplayedMonth } from '@/composables/booking/useDateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { TimeSlot } from '@/types/appointment'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { toISO8601Date } from '@/types/datetime'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
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
import { useAvailabilityStepHandlers } from '@/composables/booking/useAvailabilityStepHandlers'
import { useAvailabilityDevPanel } from '@/composables/booking/useAvailabilityDevPanel'
import { useAvailabilityEmptyState } from '@/composables/booking/useAvailabilityEmptyState'
import { useAvailabilitySlotColor } from '@/composables/booking/useAvailabilitySlotColor'
import { equals } from '@/utils/ternary/ternaryUtils'

export interface UseAvailabilityOrchestratorParams {
  wizard: UseBookingWizardReturn
  loadedWizardState: Ref<WizardStateData | null>
  computedAvailability: UseComputedAvailabilityReturn
  propertyDetailsStepData: Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown } | null>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
}

export function useAvailabilityOrchestrator(params: UseAvailabilityOrchestratorParams) {
  const {
    wizard,
    loadedWizardState,
    computedAvailability,
    propertyDetailsStepData,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef
  } = params

  const { getTodayDate } = useTimeFormatting()

  const timeSlotsWrapper = ref<ComputedRef<TimeSlot[]> | null>(null)
  const timeSlotsForDefaults = computed(() => {
    const wrapper = timeSlotsWrapper.value
    if (!wrapper || !('value' in wrapper)) return null as TimeSlot[] | null
    return wrapper.value
  }) as ComputedRef<TimeSlot[] | null>
  const timeSlotsForLogic = computed(() => {
    const wrapper = timeSlotsWrapper.value
    if (!wrapper || !('value' in wrapper)) return [] as TimeSlot[]
    return wrapper.value
  }) as ComputedRef<TimeSlot[]>

  const isEffectivelyDifferentialForDefaults = computed(() => {
    const selectedServices = wizard.selectedServiceTypeBlocks.value
    const isDifferential = selectedServices.some(s => equals(s.differential, 'true'))
    if (!isDifferential) return false
    return true
  })

  const {
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex
  } = useAvailabilityDefaults({
    loadedWizardState,
    timeSlots: timeSlotsForDefaults,
    isDifferentialService: isEffectivelyDifferentialForDefaults
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
    timeSlots: timeSlotsForLogic as ComputedRef<TimeSlot[]>,
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

  const moveablePartsScheduling = useMoveablePartsScheduling({ appointmentShape, selectedSlot })
  const {
    hasMoveableParts,
    showModal: showMoveableModal,
    moveableOptions,
    selectedSlotIndex: selectedMoveableSlotIndex,
    contingencyPeriod,
    openModal: openMoveableModal,
    closeModal: closeMoveableModal,
    selectSlot: selectMoveableSlot,
    isLoadingOptions
  } = moveablePartsScheduling

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

  const {
    handleAppointmentSlotClick,
    handleMoveableConfirm,
    handleMoveableCancel,
    handleTimeBasisChange
  } = useAvailabilityStepHandlers({
    appointmentSlotOrderIndex,
    hasMoveableParts,
    selectedSlot,
    openMoveableModal,
    closeMoveableModal,
    moveableOptions,
    selectedMoveableSlotIndex,
    confirmedMoveableScheduling,
    startTimeType
  })

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
    getTodayDate,
    firstAvailableNotice,
    selectedDateSingle,
    vDatePickerDisplayDate,
    setVDatePickerDisplayDate,
    allowedDates,
    handleDateChange,
    fieldErrors,
    isEffectivelyDifferential,
    graphBars,
    perspective,
    handleTimeBasisChange,
    selectedDate,
    appointmentSlots,
    emptyStateMessage,
    selectedButtonIndex,
    slotColor,
    handleAppointmentSlotClick,
    selectedOptionTypeBlockId,
    showMoveableModal,
    moveableOptions,
    selectedMoveableSlotIndex,
    contingencyPeriod,
    isLoadingOptions,
    selectMoveableSlot,
    handleMoveableConfirm,
    handleMoveableCancel,
    stepData,
    isFormValid,
    validateForm,
    wizard,
    clearFirstAvailableNotice
  }
}
