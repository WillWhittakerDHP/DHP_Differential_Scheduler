/**
 * PATTERN: useMoveablePartsScheduling Composable

PATTERN: Composable that detects ...
 */
import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot, TimeRange } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import { DEFAULT_CONTINGENCY, DEFAULT_OUTER_BOUNDARY_DAYS } from '@/types/moveableScheduling'
import { generateSlotsInRange } from '@/utils/booking/minimalSlotGenerator'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { useLocalTime } from '@/composables/useLocalTime'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { toRFC3339DateTime } from '@/types/datetime'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'

const logger = createLogger('useMoveablePartsScheduling')

export interface ComputeMoveableSlotsParams {
  innerBoundary: RFC3339DateTime
  outerBoundary: RFC3339DateTime
  duration: number
  minuteIncrement: number
  formatDayLabel: (iso: RFC3339DateTime) => string
  formatTimeLabel: (start: RFC3339DateTime, end: RFC3339DateTime) => string
}

/**
 * Pure computation: generate slots in range and map to MoveableSlot with labels.
 * WHY: Reduces watchEffect body complexity; testable without Vue/reactivity.
 */
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

interface UseMoveablePartsSchedulingParams {
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedSlot: ComputedRef<AppointmentSlot | null>
}

/**
 * WHY: Helper function to format day label
LEARNING: Uses useLocalTime composab...
 */
function formatDayLabel(
  isoDate: RFC3339DateTime,
  formatDateForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  // LEARNING: Use UTC methods for date comparison
  // WHY: All business logic should use UTC to avoid timezone issues
  const date = new Date(isoDate)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0))
  
  const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
  
  if (dateOnly.getTime() === today.getTime()) return 'Today'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow'
  
  // LEARNING: Use composable for UI-boundary formatting
  return formatDateForDisplay(isoDate, { month: 'short', day: 'numeric' })
}

/**
 * WHY: Helper function to format time label
LEARNING: Uses useLocalTime composa...
 */
function formatTimeLabel(
  startIso: RFC3339DateTime,
  endIso: RFC3339DateTime,
  formatTimeForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
): string {
  const startFormatted = formatTimeForDisplay(startIso, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  const endFormatted = formatTimeForDisplay(endIso, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  return `${startFormatted} - ${endFormatted}`
}

export function useMoveablePartsScheduling(params: UseMoveablePartsSchedulingParams) {
  const { appointmentShape, selectedSlot } = params
  const { formatDateForDisplay, formatTimeForDisplay } = useLocalTime()
  
  const showModal = ref(false)
  
  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  
  const selectedSlotIndex = ref<number | null>(null)
  
  // Moveable options (computed via watchEffect since it's async)
  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  
  const hasMoveableParts = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return false
    const eventShapes = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const moveableShape = getEventShapeByRole(eventShapes, 'moveable')
    if (!moveableShape) return false
    const moveableEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === moveableShape.id)
    return (moveableEventFinal?.roundedDuration ?? 0) > 0
  })
  
  const moveableDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return 0
    const eventShapes = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const moveableShape = getEventShapeByRole(eventShapes, 'moveable')
    if (!moveableShape) {
      logger.error('moveableDuration: no event shape with differentialRole=moveable')
      return 0
    }
    const moveableEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === moveableShape.id)
    return moveableEventFinal?.roundedDuration ?? 0
  })
  
  // PATTERN: Watch dependencies and update ref when they change
  watchEffect(async () => {
    if (!hasMoveableParts.value || !selectedSlot.value) {
      moveableOptions.value = null
      return
    }
    
    const slot = selectedSlot.value
    const duration = moveableDuration.value
    
    let majorTimeRange: TimeRange | null = null
    if (slot.shape.slotShape.eventFinals.length > 0) {
      const eventShapeEntities = slot.shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
      const majorEventShape = getEventShapeByRole(eventShapeEntities, 'major')
      if (!majorEventShape) {
        logger.error('moveable watchEffect: no event shape with differentialRole=major')
      }
      if (majorEventShape) {
        majorTimeRange = slot.eventTimeRanges?.[majorEventShape.name] ?? null
      }
    }
    const innerBoundary = majorTimeRange?.endTime ?? slot.totalTimeRange?.endTime
    if (!innerBoundary) {
      moveableOptions.value = null
      return
    }
    
    try {
      isLoadingOptions.value = true
      
      // LEARNING: Use UTC methods for date manipulation
      // WHY: All business logic should use UTC to avoid timezone issues
      let outerBoundary: RFC3339DateTime
      if (contingencyPeriod.value.hasContingency && contingencyPeriod.value.endDate) {
        const [year, month, day] = contingencyPeriod.value.endDate.split('-').map(Number)
        if (contingencyPeriod.value.endTime) {
          const [hours, minutes] = contingencyPeriod.value.endTime.split(':').map(Number)
          // LEARNING: Use Date.UTC() to create date in UTC
          const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0))
          outerBoundary = toRFC3339DateTime(date)
        } else {
          const date = new Date(Date.UTC(year, month - 1, day, 17, 0, 0, 0))
          outerBoundary = toRFC3339DateTime(date)
        }
      } else {
        const innerBoundaryDate = new Date(innerBoundary)
        const defaultDate = new Date(Date.UTC(
          innerBoundaryDate.getUTCFullYear(),
          innerBoundaryDate.getUTCMonth(),
          innerBoundaryDate.getUTCDate() + DEFAULT_OUTER_BOUNDARY_DAYS,
          17, 0, 0, 0
        ))
        outerBoundary = toRFC3339DateTime(defaultDate)
      }
      
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
        selectedSlotIndex: selectedSlotIndex.value
      }
    } catch (error) {
      logger.error('Error calculating moveable options:', error)
      moveableOptions.value = null
    } finally {
      isLoadingOptions.value = false
    }
  })
  
  const selectedMoveableSlot = computed<MoveableSlot | null>(() => {
    if (selectedSlotIndex.value === null || !moveableOptions.value) {
      return null
    }
    return moveableOptions.value.availableSlots[selectedSlotIndex.value] ?? null
  })
  
  const openModal = () => { 
    showModal.value = true 
  }
  
  const closeModal = () => { 
    showModal.value = false 
  }
  
  const selectSlot = (index: number) => { 
    selectedSlotIndex.value = index 
  }
  
  const resetContingency = () => { 
    contingencyPeriod.value = { ...DEFAULT_CONTINGENCY } 
  }
  
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
    resetContingency
  }
}
