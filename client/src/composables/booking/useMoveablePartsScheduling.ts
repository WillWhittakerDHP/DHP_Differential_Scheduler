/**
 * PATTERN: useMoveablePartsScheduling Composable
 *
 * Detects moveable parts and provides scheduling options. When user sets a contingency deadline,
 * fetches computed availability for the selected day with moveable duration and builds virtual
 * appointment slots via useAppointmentSlots (same pipeline as main grid) so the modal uses the
 * same components and constraint semantics.
 */
import type { Ref } from 'vue'
import { computed, ref, watch, watchEffect, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import type { PropertyDetailsData } from '@/types/propertyForm'
import { DEFAULT_CONTINGENCY, DEFAULT_OUTER_BOUNDARY_DAYS } from '@/constants/moveableScheduling'
import { createLogger } from '@/utils/logger'
import { localTime } from '@/utils/time/localTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import { resolveEventShapes } from '@/utils/booking/perspectiveResolver'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { ComputeMoveableSlotsParams } from '@/types/booking/moveablePartsScheduling'
import { generateSlotsInRange } from '@/utils/booking/minimalSlotGenerator'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { createMinimalAppointmentShapeForDuration } from '@/utils/booking/appointmentSlotBuilder'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'

const logger = createLogger('useMoveablePartsScheduling')
const DEFAULT_MOVEABLE_FALLBACK_LABEL = 'Post-Appointment Work'

function isGenericMoveableLabel(value: string | null | undefined): boolean {
  if (!value) return true
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  return (
    normalized === 'moveable part' ||
    normalized === 'movable part' ||
    normalized === 'moveable work' ||
    normalized === 'movable work'
  )
}

/** Default deadline time = end of appointment (innerBoundary) + buffer + moveable duration. */
function defaultDeadlineTime(innerBoundary: string, bufferMinutes: number, moveableDurationMinutes: number): string {
  const end = new Date(innerBoundary)
  end.setUTCMinutes(end.getUTCMinutes() + bufferMinutes + moveableDurationMinutes)
  return end.toISOString().slice(11, 16) // HH:mm
}

// ─── Pure helpers (no Vue reactivity, no side effects) ─────────────────────

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

/**
 * Compute the outer boundary for moveable scheduling based on contingency period.
 * Falls back to DEFAULT_OUTER_BOUNDARY_DAYS from the inner boundary when no contingency.
 */
export function computeOuterBoundary(
  contingencyPeriod: ContingencyPeriod,
  innerBoundary: RFC3339DateTime
): RFC3339DateTime {
  if (contingencyPeriod.hasContingency && contingencyPeriod.endDate) {
    const [year, month, day] = contingencyPeriod.endDate.split('-').map(Number)
    const hours = contingencyPeriod.endTime
      ? Number(contingencyPeriod.endTime.split(':')[0])
      : 17
    const minutes = contingencyPeriod.endTime
      ? Number(contingencyPeriod.endTime.split(':')[1])
      : 0
    return toRFC3339DateTime(new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0)))
  }

  const d = new Date(innerBoundary)
  return toRFC3339DateTime(new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(),
    d.getUTCDate() + DEFAULT_OUTER_BOUNDARY_DAYS, 17, 0, 0, 0
  )))
}

/**
 * Extract the inner boundary from a slot using the major event's end time.
 * Uses resolveEventShapes() for the major shape lookup.
 */
export function extractInnerBoundary(slot: AppointmentSlot): RFC3339DateTime | null {
  if (slot.shape.slotShape.eventFinals.length > 0) {
    const { majorEventName } = resolveEventShapes(slot.shape.slotShape.eventFinals)
    const majorTimeRange = majorEventName
      ? (slot.eventTimeRanges?.[majorEventName] ?? null)
      : null
    if (majorTimeRange?.endTime) return majorTimeRange.endTime
  }
  return slot.totalTimeRange?.endTime ?? null
}

function formatDayLabel(
  isoDate: RFC3339DateTime,
  formatDateForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  const date = new Date(isoDate)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0))

  const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))

  if (dateOnly.getTime() === today.getTime()) return 'Today'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow'

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

// ─── Composable ────────────────────────────────────────────────────────────

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
  const selectedMoveableDay = ref<string | null>(null)

  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  const moveableDaySlots = ref<ComputedSlot[]>([])
  const isLoadingMoveableDaySlots = ref(false)
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

  const moveablePartShapeName = computed(() => {
    const shape = appointmentShape.value
    const moveableEventShapeId = moveableEventFinal.value?.eventShape?.id
    const fallbackLabel = configuredMoveableFallbackLabel.value

    if (shape && moveableEventShapeId) {
      const matchingAssignments = Object.entries(shape.eventAssignmentsByPartShape)
        .filter(([, eventInstances]) =>
          eventInstances.some((eventInstance) => eventInstance.eventShapeRef === moveableEventShapeId)
        )
      const matchingPartShapes = matchingAssignments
        .map(([partShapeName]) => partShapeName)
        .filter((name) => name.trim().length > 0)
        .filter((name) => !isGenericMoveableLabel(name))

      // Prefer part-shape names (requested behavior), then event-instance names for the same moveable event.
      if (matchingPartShapes.length === 1) return matchingPartShapes[0]
      if (matchingPartShapes.length > 1) return `${matchingPartShapes[0]} +${matchingPartShapes.length - 1}`

      const matchingEventInstanceNames = matchingAssignments
        .flatMap(([, eventInstances]) => eventInstances.map((eventInstance) => eventInstance.name))
        .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        .filter((name) => !isGenericMoveableLabel(name))

      if (matchingEventInstanceNames.length === 1) return matchingEventInstanceNames[0]
      if (matchingEventInstanceNames.length > 1) {
        return `${matchingEventInstanceNames[0]} +${matchingEventInstanceNames.length - 1}`
      }
    }

    const eventShapeName = (moveableEventFinal.value?.eventShape as EventShapeEntity | undefined)?.name?.trim()
    if (eventShapeName && !isGenericMoveableLabel(eventShapeName)) {
      return eventShapeName
    }

    return fallbackLabel
  })

  // Options: inner/outer boundaries and earliestCompletion (no client-side slot list; grid uses fetch + useAppointmentSlots).
  watchEffect(async () => {
    if (!hasMoveableParts.value || !selectedSlot.value) {
      moveableOptions.value = null
      selectedMoveableDay.value = null
      return
    }

    const slot = selectedSlot.value
    const duration = moveableDuration.value
    const innerBoundary = extractInnerBoundary(slot)
    if (!innerBoundary) {
      moveableOptions.value = null
      selectedMoveableDay.value = null
      return
    }

    try {
      isLoadingOptions.value = true
      const outerBoundary = computeOuterBoundary(contingencyPeriod.value, innerBoundary)
      const innerDate = innerBoundary.slice(0, 10)
      const outerDate = outerBoundary.slice(0, 10)
      if (selectedMoveableDay.value === null || selectedMoveableDay.value < innerDate || selectedMoveableDay.value > outerDate) {
        selectedMoveableDay.value = innerDate
      }
      moveableOptions.value = {
        innerBoundary,
        outerBoundary,
        moveableDuration: duration,
        partShapeName: moveablePartShapeName.value,
        availableSlots: [],
        earliestCompletion: innerBoundary,
        selectedSlotIndex: selectedSlotIndex.value,
      }
      // Initial deadline: day of appointment, time = end of appointment + buffer + moveable duration (apply existing settings).
      if (!contingencyPeriod.value.endDate && !contingencyPeriod.value.endTime) {
        const settings = await getAvailabilitySettings()
        const bufferMinutes = settings.buffers?.appointment?.minutes ?? 0
        configuredMoveableFallbackLabel.value =
          settings.differentialPerspectives?.moveableFallbackLabel ?? DEFAULT_MOVEABLE_FALLBACK_LABEL
        contingencyPeriod.value = {
          ...contingencyPeriod.value,
          hasContingency: true,
          endDate: innerDate,
          endTime: defaultDeadlineTime(innerBoundary, bufferMinutes, duration),
        }
      }
    } catch {
      moveableOptions.value = null
      selectedMoveableDay.value = null
    } finally {
      isLoadingOptions.value = false
    }
  })

  const hasClosingDate = computed(
    () => contingencyPeriod.value.hasContingency && Boolean(contingencyPeriod.value.endDate)
  )

  // Fetch computed availability for selected day with moveable duration (same API as main grid).
  watch(
    [selectedMoveableDay, hasClosingDate, moveableDuration, placeId],
    async () => {
      const day = selectedMoveableDay.value
      const duration = moveableDuration.value
      const pid = placeId.value
      if (!hasClosingDate.value || !day || duration <= 0) {
        moveableDaySlots.value = []
        return
      }

      const start = toRFC3339DateTime(new Date(`${day}T00:00:00.000Z`))
      const end = toRFC3339DateTime(new Date(`${day}T23:59:59.999Z`))

      isLoadingMoveableDaySlots.value = true
      try {
        const data = await fetchComputedAvailabilityData({
          dateRange: { start, end },
          candidatePlaceId: pid ?? undefined,
          duration,
          dataSource: 'real',
        })
        moveableDaySlots.value = data.slotsByDay[day] ?? []
      } catch (err) {
        logger.error('Moveable day fetch failed', err)
        moveableDaySlots.value = []
      } finally {
        isLoadingMoveableDaySlots.value = false
      }
    },
    { immediate: true }
  )

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

  const setSelectedMoveableDay = (date: string | null) => {
    selectedMoveableDay.value = date
    selectedSlotIndex.value = null
  }

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
