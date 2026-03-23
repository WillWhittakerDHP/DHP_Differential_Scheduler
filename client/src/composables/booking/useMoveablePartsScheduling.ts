/**
 * PATTERN: useMoveablePartsScheduling Composable
 *
 * Detects moveable parts and provides scheduling options. When user sets a contingency deadline,
 * fetches computed availability for the inner..outer UTC range (mini useComputedAvailability) and builds virtual
 * appointment slots via useAppointmentSlots (same pipeline as main grid) so the modal uses the
 * same components and constraint semantics.
 */
import type { Ref } from 'vue'
import { computed, ref, watch, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import type { PropertyDetailsData } from '@/types/propertyForm'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import { DEFAULT_CONTINGENCY } from '@/constants/moveableScheduling'
import { useLocalTime } from '@/utils/time/localTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { createMinimalAppointmentShapeForDuration } from '@/utils/booking/appointmentSlotBuilder'
import { useMoveableAvailabilityData } from '@/composables/booking/useMoveableAvailabilityData'
import { getMoveablePartShapeName } from '@/utils/booking/moveablePartShapeName'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'
import {
  applyMoveableWindowToComputedSlots,
  buildMoveableSchedulingWindow,
} from '@/utils/booking/applyMoveableWindowToComputedSlots'
import {
  computeMoveableSlotRowDayLabel,
  computeMoveableStepperDayLabel,
} from '@/utils/booking/moveableDayDisplayLabel'

const DEFAULT_MOVEABLE_FALLBACK_LABEL = 'Post-Appointment Work'

/** Re-export for tests and consumers that import from this module. */
export { computeOuterBoundary, extractInnerBoundary } from '@/utils/booking/moveableSchedulingBounds'

const MOVEABLE_DAY_UI_COPY = {
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


interface UseMoveablePartsSchedulingParams {
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedSlot: ComputedRef<AppointmentSlot | null>
  /** Owned by orchestrator so contingency + main-grid deadline filter share state. */
  contingencyPeriod: Ref<ContingencyPeriod>
  /** For fetching moveable-day availability (same API as main grid, duration = moveable). */
  propertyDetailsStepData: Ref<PropertyDetailsData | null>
  /** Server-computed slots by day (legacy; moveable grid uses its own fetch with moveable duration). */
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
}

export interface UseMoveablePartsSchedulingReturn {
  showModal: Ref<boolean>
  contingencyPeriod: Ref<ContingencyPeriod>
  selectedSlotIndex: Ref<number | null>
  isLoadingOptions: Ref<boolean>
  /** Loading state for the selected-day availability fetch (moveable grid). */
  isLoadingMoveableDaySlots: Ref<boolean>
  hasMoveableParts: ComputedRef<boolean>
  moveableDuration: ComputedRef<number>
  moveableOptions: ComputedRef<MoveableSchedulingOptions | null>
  /** Virtual appointment slots for the selected day (same pipeline as main grid). */
  moveableAppointmentSlots: ComputedRef<AppointmentSlot[]>
  /** Step 4 day stepper heading: local Today/Tomorrow/weekday aligned with slot times. */
  moveableStepperDayLabel: ComputedRef<string>
  /** Selected calendar day for moveable grid (YYYY-MM-DD). */
  selectedMoveableDay: Ref<string | null>
  /** Set selected day (e.g. from calendar in modal). */
  setSelectedMoveableDay: (date: string | null) => void
  /** Predicate: date allowed when it is a canonical UTC day key with ≥1 slot after moveable scheduling filter. */
  allowedMoveableDates: ComputedRef<(date: unknown) => boolean>
  /** Sorted UTC day keys from fetched map that have at least one slot after scheduling filter. */
  availableMoveableDayKeys: ComputedRef<string[]>
  /** First / last of availableMoveableDayKeys (canonical stepper bounds). */
  moveableFirstDayKey: ComputedRef<string | null>
  moveableLastDayKey: ComputedRef<string | null>
  /** Transient client-only scheduling range applied to raw moveable day slots (earliest start + optional deadline end). */
  moveableSchedulingWindow: ComputedRef<MoveableSchedulingWindow | null>
  /** Current day's slots as MoveableSlot[] for saving to step data on confirm. */
  moveableSlotsForConfirm: ComputedRef<MoveableSlot[]>
  /** Moveable part shape name for modal title (e.g. "Report Writing"). */
  moveablePartShapeName: ComputedRef<string>
  selectedMoveableSlot: ComputedRef<MoveableSlot | null>
  openModal: () => void
  closeModal: () => void
  selectSlot: (index: number) => void
  resetContingency: () => void
}

export function useMoveablePartsScheduling(params: UseMoveablePartsSchedulingParams): UseMoveablePartsSchedulingReturn {
  const { appointmentShape, selectedSlot, contingencyPeriod, propertyDetailsStepData } = params
  const { formatTimeForDisplay } = useLocalTime()

  const placeId = computed(() => propertyDetailsStepData.value?.candidatePlaceId)

  const showModal = ref(false)
  const selectedSlotIndex = ref<number | null>(null)
  const configuredMoveableFallbackLabel = ref<string>(DEFAULT_MOVEABLE_FALLBACK_LABEL)

  const moveableEventFinal = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return null
    const eventShapes = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const moveableShape = getEventShapeByRoleWithOverrides(
      eventShapes,
      'moveable',
      shape.differentialEventRoleOverrides ?? null
    )
    if (!moveableShape) return null
    return shape.slotShape.eventFinals.find(ef => ef.eventShape.id === moveableShape.id) ?? null
  })

  const hasMoveableParts = computed(() => (moveableEventFinal.value?.roundedDuration ?? 0) > 0)

  const moveableDuration = computed(
    () => moveableEventFinal.value?.roundedDuration ?? 0
  )

  const moveablePartShapeName = computed(() =>
    getMoveablePartShapeName(
      appointmentShape.value,
      moveableEventFinal.value?.eventShape?.id,
      configuredMoveableFallbackLabel.value,
      (moveableEventFinal.value?.eventShape as EventShapeEntity | undefined)?.name?.trim()
    )
  )

  const moveableData = useMoveableAvailabilityData({
    hasMoveableParts,
    selectedSlot,
    contingencyPeriod,
    selectedSlotIndex,
    moveableDuration,
    moveablePartShapeName,
    placeId,
    configuredMoveableFallbackLabelRef: configuredMoveableFallbackLabel,
  })

  const {
    moveableOptions,
    isLoadingOptions,
    moveableDaySlots,
    isLoadingMoveableDaySlots,
    selectedMoveableDay,
    setSelectedMoveableDay: setSelectedMoveableDayInner,
    afterBufferMinutes,
    moveableSlotsByDay,
  } = moveableData

  const setSelectedMoveableDay = (date: string | null) => {
    setSelectedMoveableDayInner(date)
    selectedSlotIndex.value = null
  }

  const hasContingencyClosingDate = computed(
    () =>
      contingencyPeriod.value.hasContingency === true &&
      Boolean(contingencyPeriod.value.endDate && contingencyPeriod.value.endTime)
  )

  const moveableSchedulingWindow = computed(() =>
    buildMoveableSchedulingWindow(
      moveableOptions.value,
      afterBufferMinutes.value,
      hasContingencyClosingDate.value
    )
  )

  const moveableServerSlotsForDay = computed(() => {
    const slots = moveableDaySlots.value
    if (!moveableOptions.value) return []
    return applyMoveableWindowToComputedSlots(
      slots,
      moveableSchedulingWindow.value,
      'exclude'
    )
  })
  const moveableShapeOverride = computed(() =>
    createMinimalAppointmentShapeForDuration(moveableDuration.value)
  )

  const { appointmentSlots: moveableAppointmentSlots } = useAppointmentSlots({
    blockInstances: computed(() => []),
    serverSlotsForDay: moveableServerSlotsForDay,
    selectedButtonIndex: selectedSlotIndex,
    perspective: computed(() => 'nonDifferential' as const),
    isDifferentialService: computed(() => false),
    appointmentShapeOverride: moveableShapeOverride,
  })

  const moveableStepperDayLabel = computed(() =>
    computeMoveableStepperDayLabel(
      selectedMoveableDay.value,
      moveableAppointmentSlots.value,
      MOVEABLE_DAY_UI_COPY
    )
  )

  const availableMoveableDayKeys = computed<string[]>(() => {
    const map = moveableSlotsByDay.value
    const schedulingRange = moveableSchedulingWindow.value
    return [...map.keys()]
      .filter((key) => {
        const raw = map.get(key) ?? []
        return applyMoveableWindowToComputedSlots(raw, schedulingRange, 'exclude').length > 0
      })
      .sort()
  })

  const allowedMoveableDates = computed(() => {
    const keys = new Set(availableMoveableDayKeys.value)
    return (date: unknown): boolean => typeof date === 'string' && keys.has(date)
  })

  const moveableFirstDayKey = computed(() => availableMoveableDayKeys.value[0] ?? null)

  const moveableLastDayKey = computed(() => {
    const keys = availableMoveableDayKeys.value
    return keys.length > 0 ? keys[keys.length - 1] ?? null : null
  })

  watch(
    [availableMoveableDayKeys, selectedMoveableDay],
    ([keys, day]) => {
      if (keys.length === 0) return
      if (day === null || !keys.includes(day)) {
        setSelectedMoveableDay(keys[0] ?? null)
      }
    }
  )

  const moveableSlotsForConfirm = computed<MoveableSlot[]>(() =>
    moveableAppointmentSlots.value.map((s) => {
      const startTime = toRFC3339DateTime(new Date(s.startTime))
      const endTime = toRFC3339DateTime(new Date(s.totalTimeRange?.endTime ?? s.startTime))
      return {
        startTime,
        endTime,
        duration: s.shape.slotShape.roundedDuration,
        dayLabel: computeMoveableSlotRowDayLabel(startTime, MOVEABLE_DAY_UI_COPY),
        timeLabel: formatTimeLabel(startTime, endTime, formatTimeForDisplay),
      }
    })
  )

  const selectedMoveableSlot = computed<MoveableSlot | null>(() => {
    const idx = selectedSlotIndex.value
    const slots = moveableSlotsForConfirm.value
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
    isLoadingMoveableDaySlots,
    hasMoveableParts,
    moveableDuration,
    moveableOptions: computed(() => moveableOptions.value),
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
    moveableSlotsForConfirm,
    selectedMoveableSlot,
    openModal,
    closeModal,
    selectSlot,
    resetContingency,
  }
}
