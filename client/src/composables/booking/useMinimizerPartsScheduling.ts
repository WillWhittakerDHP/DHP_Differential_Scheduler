/**
 * PATTERN: useMinimizerPartsScheduling Composable
 *
 * Detects minimizer parts and provides scheduling options. When user sets a contingency deadline,
 * fetches computed availability for the inner..outer UTC range (mini useComputedAvailability) and builds virtual
 * appointment slots via useAppointmentSlots (same pipeline as main grid) so the modal uses the
 * same components and constraint semantics.
 */
import type { Ref } from 'vue'
import { computed, ref, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MinimizerSchedulingOptions, MinimizerSlot } from '@/types/minimizerScheduling'
import type { PropertyDetailsData } from '@/types/propertyForm'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import { DEFAULT_CONTINGENCY } from '@/constants/minimizerScheduling'
import { useLocalTime } from '@/utils/time/localTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import {
  listMinimizerSegmentsFromAppointmentShape,
  sumMinimizerSegmentsRoundedDurationMinutes,
} from '@/utils/booking/minimizerEventShapes'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { createMinimalAppointmentShapeForDuration } from '@/utils/booking/appointmentSlotBuilder'
import { useMinimizerAvailabilityData } from '@/composables/booking/useMinimizerAvailabilityData'
import { useMinimizerAvailableDayKeys } from '@/composables/booking/useMinimizerAvailableDayKeys'
import { formatMinimizerSegmentsDisplayLabel } from '@/utils/booking/minimizerPartShapeName'
import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'
import {
  applyMinimizerWindowToComputedSlots,
  buildMinimizerSchedulingWindow,
} from '@/utils/booking/applyMinimizerWindowToComputedSlots'
import {
  computeMinimizerSlotRowDayLabel,
  computeMinimizerStepperDayLabel,
} from '@/utils/booking/minimizerDayDisplayLabel'

const DEFAULT_MINIMIZER_FALLBACK_LABEL = 'Post-Appointment Work'

/** Re-export for tests and consumers that import from this module. */
export { computeOuterBoundary, extractInnerBoundary } from '@/utils/booking/minimizerSchedulingBounds'

const MINIMIZER_DAY_UI_COPY = {
  noSelection: AVAILABILITY_SUBSTEP_UI.NO_DAY_SELECTED,
  today: AVAILABILITY_SUBSTEP_UI.TODAY,
  tomorrow: AVAILABILITY_SUBSTEP_UI.TOMORROW,
} as const

function formatTimeLabel(
  startIso: RFC3339DateTime,
  endIso: RFC3339DateTime,
  formatTimeForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  const startFormatted = formatTimeForDisplay(startIso, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endFormatted = formatTimeForDisplay(endIso, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${startFormatted} - ${endFormatted}`
}


interface UseMinimizerPartsSchedulingParams {
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedSlot: ComputedRef<AppointmentSlot | null>
  /** Owned by orchestrator so contingency + main-grid deadline filter share state. */
  contingencyPeriod: Ref<ContingencyPeriod>
  /** For fetching minimizer-day availability (same API as main grid; duration = minimizer segment minutes). */
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  /** Server-computed slots by day (legacy; minimizer grid uses its own fetch with minimizer duration). */
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
}

export interface UseMinimizerPartsSchedulingReturn {
  showModal: Ref<boolean>
  contingencyPeriod: Ref<ContingencyPeriod>
  selectedSlotIndex: Ref<number | null>
  isLoadingOptions: Ref<boolean>
  /** Loading state for the selected-day availability fetch (minimizer grid). */
  isLoadingMinimizerDaySlots: Ref<boolean>
  hasMinimizerParts: ComputedRef<boolean>
  minimizerDuration: ComputedRef<number>
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>
  /** Virtual appointment slots for the selected day (same pipeline as main grid). */
  minimizerAppointmentSlots: ComputedRef<AppointmentSlot[]>
  /** Step 4 day stepper heading: local Today/Tomorrow/weekday aligned with slot times. */
  minimizerStepperDayLabel: ComputedRef<string>
  /** Selected calendar day for minimizer grid (YYYY-MM-DD). */
  selectedMinimizerDay: Ref<string | null>
  /** Set selected day (e.g. from calendar in modal). */
  setSelectedMinimizerDay: (date: string | null) => void
  /** Predicate: date allowed when it is a canonical UTC day key with ≥1 slot after minimizer scheduling filter. */
  allowedMinimizerDates: ComputedRef<(date: unknown) => boolean>
  /** Sorted UTC day keys from fetched map that have at least one slot after scheduling filter. */
  availableMinimizerDayKeys: ComputedRef<string[]>
  /** First / last of availableMinimizerDayKeys (canonical stepper bounds). */
  minimizerFirstDayKey: ComputedRef<string | null>
  minimizerLastDayKey: ComputedRef<string | null>
  /** Transient client-only scheduling range applied to raw minimizer day slots (earliest start + optional deadline end). */
  minimizerSchedulingWindow: ComputedRef<MinimizerSchedulingWindow | null>
  /** Current day's slots as MinimizerSlot[] for saving to step data on confirm. */
  minimizerSlotsForConfirm: ComputedRef<MinimizerSlot[]>
  /** Minimizer part shape name for modal title (e.g. "Report Writing"). */
  minimizerPartShapeName: ComputedRef<string>
  selectedMinimizerSlot: ComputedRef<MinimizerSlot | null>
  openModal: () => void
  closeModal: () => void
  selectSlot: (index: number) => void
  resetContingency: () => void
}

export function useMinimizerPartsScheduling(params: UseMinimizerPartsSchedulingParams): UseMinimizerPartsSchedulingReturn {
  const { appointmentShape, selectedSlot, contingencyPeriod, propertyDetailsStepData } = params
  const { formatTimeForDisplay } = useLocalTime()

  const placeId = computed(() => propertyDetailsStepData.value?.candidatePlaceId)

  const showModal = ref(false)
  const selectedSlotIndex = ref<number | null>(null)
  const configuredMinimizerFallbackLabel = ref<string>(DEFAULT_MINIMIZER_FALLBACK_LABEL)

  /**
   * Ordered minimizer segments (eventFinals order). All segments contribute to duration and labels.
   * WHY aggregate duration: fetch + scheduling range + inspection filter reserve total minutes before deadline.
   * Per-segment chaining (inner_i = completion instant of segment i−1) is deferred — future UX if we pick
   * each segment’s slot in sequence; current single step-4 flow uses one grid with total minutes.
   */
  const minimizerSegments = computed(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return []
    }
    return listMinimizerSegmentsFromAppointmentShape(shape)
  })

  const hasMinimizerParts = computed(() => minimizerSegments.value.some((s) => s.roundedDuration > 0))

  const minimizerDuration = computed(() =>
    sumMinimizerSegmentsRoundedDurationMinutes(appointmentShape.value)
  )

  const minimizerPartShapeName = computed(() =>
    formatMinimizerSegmentsDisplayLabel(
      minimizerSegments.value,
      appointmentShape.value,
      configuredMinimizerFallbackLabel.value
    )
  )

  const minimizerData = useMinimizerAvailabilityData({
    hasMinimizerParts,
    selectedSlot,
    contingencyPeriod,
    selectedSlotIndex,
    minimizerDuration,
    minimizerPartShapeName,
    placeId,
    configuredMinimizerFallbackLabelRef: configuredMinimizerFallbackLabel,
  })

  const {
    minimizerOptions,
    isLoadingOptions,
    minimizerDaySlots,
    isLoadingMinimizerDaySlots,
    selectedMinimizerDay,
    setSelectedMinimizerDay: setSelectedMinimizerDayInner,
    afterBufferMinutes,
    minimizerSlotsByDay,
  } = minimizerData

  const setSelectedMinimizerDay = (date: string | null) => {
    setSelectedMinimizerDayInner(date)
    selectedSlotIndex.value = null
  }

  const hasContingencyClosingDate = computed(
    () =>
      contingencyPeriod.value.hasContingency === true &&
      Boolean(contingencyPeriod.value.endDate && contingencyPeriod.value.endTime)
  )

  const minimizerSchedulingWindow = computed(() =>
    buildMinimizerSchedulingWindow(
      minimizerOptions.value,
      afterBufferMinutes.value,
      hasContingencyClosingDate.value
    )
  )

  const minimizerServerSlotsForDay = computed(() => {
    const slots = minimizerDaySlots.value
    if (!minimizerOptions.value) return []
    return applyMinimizerWindowToComputedSlots(
      slots,
      minimizerSchedulingWindow.value,
      'exclude'
    )
  })
  const minimizerShapeOverride = computed(() =>
    createMinimalAppointmentShapeForDuration(minimizerDuration.value)
  )

  const { appointmentSlots: minimizerAppointmentSlots } = useAppointmentSlots({
    blockInstances: computed(() => []),
    serverSlotsForDay: minimizerServerSlotsForDay,
    selectedButtonIndex: selectedSlotIndex,
    perspective: computed(() => 'nonDifferential' as const),
    isDifferentialService: computed(() => false),
    appointmentShapeOverride: minimizerShapeOverride,
  })

  const minimizerStepperDayLabel = computed(() =>
    computeMinimizerStepperDayLabel(
      selectedMinimizerDay.value,
      minimizerAppointmentSlots.value,
      MINIMIZER_DAY_UI_COPY
    )
  )

  const {
    availableMinimizerDayKeys,
    allowedMinimizerDates,
    minimizerFirstDayKey,
    minimizerLastDayKey,
  } = useMinimizerAvailableDayKeys({
    minimizerSlotsByDay,
    minimizerSchedulingWindow,
    selectedMinimizerDay,
    setSelectedMinimizerDay,
  })

  const minimizerSlotsForConfirm = computed<MinimizerSlot[]>(() =>
    minimizerAppointmentSlots.value.map((s) => {
      const startTime = toRFC3339DateTime(new Date(s.startTime))
      const endTime = toRFC3339DateTime(new Date(s.totalTimeRange?.endTime ?? s.startTime))
      return {
        startTime,
        endTime,
        duration: s.shape.slotShape.roundedDuration,
        dayLabel: computeMinimizerSlotRowDayLabel(startTime, MINIMIZER_DAY_UI_COPY),
        timeLabel: formatTimeLabel(startTime, endTime, formatTimeForDisplay),
      }
    })
  )

  const selectedMinimizerSlot = computed<MinimizerSlot | null>(() => {
    const idx = selectedSlotIndex.value
    const slots = minimizerSlotsForConfirm.value
    if (idx === null || idx < 0 || idx >= slots.length) return null
    return slots[idx] ?? null
  })

  const openModal = () => { showModal.value = true }
  const closeModal = () => { showModal.value = false }
  const selectSlot = (index: number) => { selectedSlotIndex.value = index }
  const resetContingency = () => { contingencyPeriod.value = { ...DEFAULT_CONTINGENCY } }

  return {
    showModal,
    contingencyPeriod,
    selectedSlotIndex,
    isLoadingOptions,
    isLoadingMinimizerDaySlots,
    hasMinimizerParts,
    minimizerDuration,
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
    minimizerSlotsForConfirm,
    selectedMinimizerSlot,
    openModal,
    closeModal,
    selectSlot,
    resetContingency,
  }
}
