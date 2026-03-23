/**
 * WHY: useAvailabilityLogic Composable

WHY: Moves date range calculation, prop...
 */
import { computed, watch, ref, type Ref, type ComputedRef } from 'vue'
import { matchLoadedTimeSlots as matchLoadedTimeSlotsUtil } from '@/composables/booking/useTimeSlotMatching'
import type { LoadedTimeSlot } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot, AppointmentSlots } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { PropertyDetails } from '@/types/availability'
import { equals } from '@/utils/ternary/ternaryUtils'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import { buildRfc3339UtcDayRangeForSelectedDate } from '@/utils/booking/availabilityDateRangeForApi'
import { buildTimeSlotsPerDayFromSlots } from '@/utils/booking/availabilitySlotGrouping'
import { buildAppointmentSlotsPerDayRows } from '@/utils/booking/availabilityAppointmentSlotsPerDay'
import { selectedBlocksHaveDifferentialOverride } from '@/utils/booking/availabilityDifferentialOverride'
import { propertyDetailsSliceForAvailability } from '@/utils/booking/availabilityPropertyDetailsSlice'
import { iso8601DateFromPickerValue } from '@/utils/booking/selectedDatePickerNormalize'
import { accumulateWizardSelectedBlockInstances } from '@/utils/booking/wizardSelectedBlocksAccumulation'
import type { TimeSlotsPerDay } from '@/types/booking/availabilityLogic'

export type { TimeSlotsPerDay }

/**
 * Canonical "is differential booking" from selected block instances (Phase 6.4).
 * Single source of truth for "service is differential"; used by useAvailabilityLogic
 * and useAvailabilityOrchestrator so we don't duplicate derivation.
 */
export function isDifferentialFromSelectedBlocks(blocks: BookingBlockInstance[]): boolean {
  return blocks.some((s) => equals(s.differential, 'true'))
}

interface DateRange {
  start: ISO8601Date | null
  end: ISO8601Date | null
}

interface UseAvailabilityLogicParams {
  selectedDate: Ref<DateRange>
  propertyDetailsStepData: Ref<PropertyDetails | null> | null
  wizard: {
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  }
  timeSlots: ComputedRef<TimeSlot[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

interface AppointmentSlotsPerDay {
  date: string
  appointmentSlots: AppointmentSlots
}

export interface UseAvailabilityLogicReturn {
  dateRangeForApi: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  propertyDetails: ComputedRef<PropertyDetails | null>
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
  timeSlotsPerDay: Ref<TimeSlotsPerDay[]>
  appointmentSlotsPerDay: ComputedRef<AppointmentSlotsPerDay[]>
  selectedDateSingle: ComputedRef<string | null>
  currentAppointmentSlots: ComputedRef<TimeSlot[]>
  isDifferentialService: ComputedRef<boolean>
  isEffectivelyDifferential: ComputedRef<boolean>
  selectedTimeSlots: ComputedRef<SlotTimeBounds[] | null>
  matchLoadedTimeSlots: (loadedSlots: LoadedTimeSlot[], availableSlots: TimeSlot[], majorAppointmentSlot: Ref<TimeSlot | null>, minorAppointmentSlot: Ref<TimeSlot | null>) => void
}

/**
 * WHY: useAvailabilityLogic composable

WHY: Extracts business logic from compo...
 */
export function useAvailabilityLogic(params: UseAvailabilityLogicParams): UseAvailabilityLogicReturn {
  const {
    selectedDate,
    propertyDetailsStepData,
    wizard,
    timeSlots,
    loadedWizardState: _loadedWizardState,
  } = params

  const { settings } = useAvailabilitySettings()

  const dateRangeForApi = computed(() => {
    const startValue = selectedDate.value.start
    if (!startValue) {
      return null
    }
    return buildRfc3339UtcDayRangeForSelectedDate(startValue)
  })

  const propertyDetails = computed(() => propertyDetailsSliceForAvailability(propertyDetailsStepData?.value))

  const accumulatedBlockInstances = computed(() => accumulateWizardSelectedBlockInstances(wizard))

  const timeSlotsPerDay = ref<TimeSlotsPerDay[]>([])

  const appointmentSlotsPerDay = computed<AppointmentSlotsPerDay[]>(() => {
    const slots = timeSlots.value
    const date = selectedDate.value
    const blockInstances = accumulatedBlockInstances.value

    if (!slots || slots.length === 0 || !date?.start) {
      return []
    }

    return buildAppointmentSlotsPerDayRows(slots, blockInstances, settings.value)
  })

  const isDifferentialService = computed(() =>
    isDifferentialFromSelectedBlocks(wizard.selectedServiceTypeBlocks.value)
  )

  const hasDifferentialOverride = computed(() =>
    selectedBlocksHaveDifferentialOverride(
      wizard.selectedServiceTypeBlocks.value,
      wizard.selectedOptionTypeBlocks.value
    )
  )

  const isEffectivelyDifferential = computed(() => {
    if (!isDifferentialService.value) {
      return false
    }
    if (hasDifferentialOverride.value) {
      return false
    }
    return true
  })

  watch(
    [timeSlots, selectedDate],
    ([slots, date]) => {
      if (!slots || slots.length === 0 || !date?.start) {
        timeSlotsPerDay.value = []
        return
      }
      timeSlotsPerDay.value = buildTimeSlotsPerDayFromSlots(slots)
    },
    { immediate: true }
  )

  const selectedDateSingle = computed({
    get: () => selectedDate.value.start,
    set: (value: ISO8601Date | Date | null) => {
      const dateString = iso8601DateFromPickerValue(value)
      selectedDate.value = { start: dateString, end: null }
    },
  })

  const currentAppointmentSlots = computed(() => {
    if (!selectedDate.value.start) {
      return []
    }
    const daySlots = timeSlotsPerDay.value.find((day) => day.date === selectedDate.value.start)
    if (!daySlots) {
      return []
    }
    return daySlots.inspectorTimeSlots
  })

  const matchLoadedTimeSlots = matchLoadedTimeSlotsUtil

  const selectedTimeSlots = computed<SlotTimeBounds[] | null>(() => null)

  return {
    dateRangeForApi,
    propertyDetails,
    accumulatedBlockInstances,
    timeSlotsPerDay,
    appointmentSlotsPerDay,
    selectedDateSingle,
    currentAppointmentSlots,
    isDifferentialService,
    isEffectivelyDifferential,
    selectedTimeSlots,
    matchLoadedTimeSlots,
  }
}
