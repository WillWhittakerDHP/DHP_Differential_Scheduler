import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { UsePerspectiveMappingParams } from '@/types/booking/perspectiveMapping'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { useOptionTypeBlockSelection } from '@/composables/booking/useOptionTypeBlockSelection'
import { useAppointmentDuration } from '@/composables/booking/useAppointmentDuration'
import { useMockCalendarRefresh } from '@/composables/booking/useMockCalendarRefresh'
import { usePerspectiveMapping } from '@/composables/booking/usePerspectiveMapping'
import { useAvailabilitySlotColor } from '@/composables/booking/useAvailabilitySlotColor'
import {
  wireAppointmentDurationToRef,
  wireDisplayedMonthToVDatePicker,
  wireSelectedDateToDisplayedMonth,
  wireVDatePickerToDisplayedMonth,
} from '@/composables/booking/useAvailabilityOrchestratorCalendarWatches'
import { wireFirstAvailableDateNotice } from '@/composables/booking/useAvailabilityOrchestratorFirstAvailableWatch'
import type { AvailabilityOrchestratorTimeSlotsShell } from '@/composables/booking/useAvailabilityOrchestratorTimeSlotsShell'
import type { AvailabilityOrchestratorSlotComputeds } from '@/composables/booking/useAvailabilityOrchestratorSlotComputeds'
import type { UseAppointmentShapeParams } from '@/types/booking/appointmentShape'

export interface AvailabilityOrchestratorPostFetchPhaseResult {
  availabilityMinuteIncrement: ComputedRef<number>
  selectedOptionTypeBlockId: ReturnType<typeof useOptionTypeBlockSelection>['selectedOptionTypeBlockId']
  appointmentDuration: ReturnType<typeof useAppointmentDuration>['appointmentDuration']
  mockRefreshKey: ReturnType<typeof useMockCalendarRefresh>['mockRefreshKey']
  perspective: ReturnType<typeof usePerspectiveMapping>['perspective']
  selectedButtonIndex: ComputedRef<number | null>
  slotColor: ReturnType<typeof useAvailabilitySlotColor>['slotColor']
  allowedDates: ReturnType<typeof useAvailabilitySlotColor>['allowedDates']
  firstAvailableDate: ReturnType<typeof useAvailabilitySlotColor>['firstAvailableDate']
  firstAvailableNotice: Ref<string | null>
}

export function setupAvailabilityOrchestratorPostFetchPhase(input: {
  shell: AvailabilityOrchestratorTimeSlotsShell
  slotComputeds: AvailabilityOrchestratorSlotComputeds
  computedAvailability: UseComputedAvailabilityReturn
  wizard: UseBookingWizardReturn
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
  appointmentDurationRef: Ref<number | null>
  vDatePickerDisplayDate: Ref<Date>
  selectedDate: UseAvailabilityUIParams['selectedDate']
  startTimeType: UsePerspectiveMappingParams['startTimeType']
  appointmentSlotOrderIndex: Ref<number | null>
  accumulatedBlockInstances: UseAppointmentShapeParams['blockInstances']
}): AvailabilityOrchestratorPostFetchPhaseResult {
  const {
    shell,
    slotComputeds,
    computedAvailability,
    wizard,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef,
    vDatePickerDisplayDate,
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex,
    accumulatedBlockInstances,
  } = input

  const availabilityMinuteIncrement = computed(
    () => computedAvailability.computedData.value?.minuteIncrement ?? 15
  )
  shell.timeSlotsWrapper.value = slotComputeds.timeSlotsFromServer

  const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    availableOptionTypeBlocks: wizard.availableOptionTypeBlocks,
  })

  const { appointmentDuration } = useAppointmentDuration({ accumulatedBlockInstances })
  const { mockRefreshKey } = useMockCalendarRefresh()

  wireVDatePickerToDisplayedMonth({ vDatePickerDisplayDate, displayedMonth, updateDisplayedMonth })
  wireAppointmentDurationToRef({ appointmentDuration, appointmentDurationRef })
  wireDisplayedMonthToVDatePicker({ displayedMonth, vDatePickerDisplayDate })
  wireSelectedDateToDisplayedMonth({ selectedDate, updateDisplayedMonth })

  const { perspective } = usePerspectiveMapping({ startTimeType })
  const selectedButtonIndex = computed(() => appointmentSlotOrderIndex.value)

  const { slotColor, allowedDates, firstAvailableDate } = useAvailabilitySlotColor({
    startTimeType,
    slotsByDay: computedAvailability.slotsByDay,
  })

  const firstAvailableNotice = ref<string | null>(null)
  wireFirstAvailableDateNotice({ firstAvailableDate, selectedDate, firstAvailableNotice })

  return {
    availabilityMinuteIncrement,
    selectedOptionTypeBlockId,
    appointmentDuration,
    mockRefreshKey,
    perspective,
    selectedButtonIndex,
    slotColor,
    allowedDates,
    firstAvailableDate,
    firstAvailableNotice,
  }
}
