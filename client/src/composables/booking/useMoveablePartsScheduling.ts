/**
 * PATTERN: useMoveablePartsScheduling Composable
 *
 * Detects moveable parts and provides scheduling options. When user sets a contingency deadline,
 * fetches computed availability for the selected day with moveable duration and builds virtual
 * appointment slots via useAppointmentSlots (same pipeline as main grid) so the modal uses the
 * same components and constraint semantics.
 */
import type { Ref } from 'vue'
import { computed, ref, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import type { PropertyDetailsData } from '@/types/propertyForm'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import { DEFAULT_CONTINGENCY } from '@/constants/moveableScheduling'
import { createLogger } from '@/utils/logger'
import { localTime } from '@/utils/time/localTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { ComputeMoveableSlotsParams } from '@/types/booking/moveablePartsScheduling'
import { generateSlotsInRange } from '@/utils/booking/minimalSlotGenerator'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { createMinimalAppointmentShapeForDuration } from '@/utils/booking/appointmentSlotBuilder'
import { useMoveableAvailabilityData } from '@/composables/booking/useMoveableAvailabilityData'
import { getMoveablePartShapeName } from '@/utils/booking/moveablePartShapeName'

const logger = createLogger('useMoveablePartsScheduling')
const DEFAULT_MOVEABLE_FALLBACK_LABEL = 'Post-Appointment Work'

/** Exported for tests. Moveable grid now uses virtual appointment slots from useAppointmentSlots. */
export function computeMoveableSlots(params: ComputeMoveableSlotsParams): MoveableSlot[] {
  const {
    innerBoundary,
    outerBoundary,
    duration,
    minuteIncrement,
    formatDayLabel,
    formatTimeLabel,
  } = params
  const slots = generateSlotsInRange({
    startBoundary: innerBoundary,
    endBoundary: outerBoundary,
    duration,
    minuteIncrement,
    includeFlags: { major: false, minor: false, moveable: true },
  })
  return slots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    duration: slot.duration,
    dayLabel: formatDayLabel(slot.startTime),
    timeLabel: formatTimeLabel(slot.startTime, slot.endTime),
  }))
}

/** Re-export for tests and consumers that import from this module. */
export { computeOuterBoundary, extractInnerBoundary } from '@/utils/booking/moveableSchedulingBounds'

function formatDayLabel(
  isoDate: RFC3339DateTime,
  formatDateForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  const date = new Date(isoDate)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0))

  const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))

  if (dateOnly.getTime() === today.getTime()) return AVAILABILITY_SUBSTEP_UI.TODAY
  if (dateOnly.getTime() === tomorrow.getTime()) return AVAILABILITY_SUBSTEP_UI.TOMORROW

  return formatDateForDisplay(isoDate, { month: 'short', day: 'numeric' })
}

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
  /** Selected calendar day for moveable grid (YYYY-MM-DD). */
  selectedMoveableDay: Ref<string | null>
  /** Set selected day (e.g. from calendar in modal). */
  setSelectedMoveableDay: (date: string | null) => void
  /** Predicate for calendar: date allowed when within inner/outer boundary. */
  allowedMoveableDates: ComputedRef<(date: unknown) => boolean>
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
  const { appointmentShape, selectedSlot, propertyDetailsStepData } = params
  const { formatDateForDisplay, formatTimeForDisplay } = localTime()

  const placeId = computed(() => propertyDetailsStepData.value?.candidatePlaceId)

  const showModal = ref(false)
  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  const selectedSlotIndex = ref<number | null>(null)
  const configuredMoveableFallbackLabel = ref<string>(DEFAULT_MOVEABLE_FALLBACK_LABEL)

  const moveableEventFinal = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return null
    const eventShapes = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const moveableShape = getEventShapeByRole(eventShapes, 'moveable')
    if (!moveableShape) return null
    return shape.slotShape.eventFinals.find(ef => ef.eventShape.id === moveableShape.id) ?? null
  })

  const hasMoveableParts = computed(() => (moveableEventFinal.value?.roundedDuration ?? 0) > 0)

  const moveableDuration = computed(() => {
    if (!moveableEventFinal.value) {
      logger.error('moveableDuration: no event shape with differentialRole=moveable')
      return 0
    }
    return moveableEventFinal.value.roundedDuration ?? 0
  })

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
  } = moveableData

  const setSelectedMoveableDay = (date: string | null) => {
    setSelectedMoveableDayInner(date)
    selectedSlotIndex.value = null
  }

  const moveableServerSlotsForDay = computed(() => moveableDaySlots.value)
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

  const allowedMoveableDates = computed(() => {
    const opts = moveableOptions.value
    if (!opts) return () => false
    const inner = opts.innerBoundary.slice(0, 10)
    const outer = opts.outerBoundary.slice(0, 10)
    return (date: unknown) => {
      if (typeof date !== 'string') return false
      return date >= inner && date <= outer
    }
  })

  const moveableSlotsForConfirm = computed<MoveableSlot[]>(() =>
    moveableAppointmentSlots.value.map((s) => {
      const startTime = toRFC3339DateTime(new Date(s.startTime))
      const endTime = toRFC3339DateTime(new Date(s.totalTimeRange?.endTime ?? s.startTime))
      return {
        startTime,
        endTime,
        duration: s.shape.slotShape.roundedDuration,
        dayLabel: formatDayLabel(startTime, formatDateForDisplay),
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
    moveablePartShapeName,
    selectedMoveableDay,
    setSelectedMoveableDay,
    allowedMoveableDates,
    moveableSlotsForConfirm,
    selectedMoveableSlot,
    openModal,
    closeModal,
    selectSlot,
    resetContingency,
  }
}
