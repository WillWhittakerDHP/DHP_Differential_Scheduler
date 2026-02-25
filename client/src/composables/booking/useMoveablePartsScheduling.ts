/**
 * PATTERN: useMoveablePartsScheduling Composable
 *
 * Detects moveable parts in an appointment shape and generates
 * scheduling options for them. Uses resolveEventShapes() from
 * perspectiveResolver.ts for major shape lookups instead of
 * inline getEventShapeByRole calls.
 */
import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import { DEFAULT_CONTINGENCY, DEFAULT_OUTER_BOUNDARY_DAYS } from '@/constants/moveableScheduling'
import { generateSlotsInRange } from '@/utils/booking/minimalSlotGenerator'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { localTime } from '@/utils/time/localTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/utils/datetime'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import { resolveEventShapes } from '@/utils/booking/perspectiveResolver'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputeMoveableSlotsParams } from '@/types/booking/moveablePartsScheduling'

export type { ComputeMoveableSlotsParams } from '@/types/booking/moveablePartsScheduling'

const logger = createLogger('useMoveablePartsScheduling')

// ─── Pure helpers (no Vue reactivity, no side effects) ─────────────────────

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
}

export function useMoveablePartsScheduling(params: UseMoveablePartsSchedulingParams) {
  const { appointmentShape, selectedSlot } = params
  const { formatDateForDisplay, formatTimeForDisplay } = localTime()

  const showModal = ref(false)
  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  const selectedSlotIndex = ref<number | null>(null)

  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)

  // Single computed for the moveable event shape — used by hasMoveableParts + moveableDuration
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

  watchEffect(async () => {
    if (!hasMoveableParts.value || !selectedSlot.value) {
      moveableOptions.value = null
      return
    }

    const slot = selectedSlot.value
    const duration = moveableDuration.value
    const innerBoundary = extractInnerBoundary(slot)
    if (!innerBoundary) {
      moveableOptions.value = null
      return
    }

    try {
      isLoadingOptions.value = true
      const outerBoundary = computeOuterBoundary(contingencyPeriod.value, innerBoundary)

      const availabilitySettings = await getAvailabilitySettings()
      const availableSlots = computeMoveableSlots({
        innerBoundary,
        outerBoundary,
        duration,
        minuteIncrement: availabilitySettings.minuteIncrement,
        formatDayLabel: (iso) => formatDayLabel(iso, formatDateForDisplay),
        formatTimeLabel: (start, end) => formatTimeLabel(start, end, formatTimeForDisplay),
      })

      const earliestCompletion = availableSlots.length > 0 ? availableSlots[0].startTime : outerBoundary
      moveableOptions.value = {
        innerBoundary,
        outerBoundary,
        moveableDuration: duration,
        availableSlots,
        earliestCompletion,
        selectedSlotIndex: selectedSlotIndex.value,
      }
    } catch (error) {
      logger.error('Error calculating moveable options:', error)
      moveableOptions.value = null
    } finally {
      isLoadingOptions.value = false
    }
  })

  const selectedMoveableSlot = computed<MoveableSlot | null>(() => {
    if (selectedSlotIndex.value === null || !moveableOptions.value) return null
    return moveableOptions.value.availableSlots[selectedSlotIndex.value] ?? null
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

    hasMoveableParts,
    moveableDuration,
    moveableOptions: computed(() => moveableOptions.value),
    selectedMoveableSlot,

    openModal,
    closeModal,
    selectSlot,
    resetContingency,
  }
}
