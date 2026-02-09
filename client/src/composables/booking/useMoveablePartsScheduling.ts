/**
 * useMoveablePartsScheduling Composable
 * 
 * LEARNING: Manages moveable parts scheduling state and calculations
 * WHY: Extracts moveable parts scheduling logic from component
 * PATTERN: Composable that detects moveable parts, manages modal state, and calculates available slots
 * Session 1.4.15: Moveable Parts Scheduling Modal
 */

import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions, MoveableSlot } from '@/types/moveableScheduling'
import { DEFAULT_CONTINGENCY, DEFAULT_OUTER_BOUNDARY_DAYS } from '@/types/moveableScheduling'
import { computeSlotAvailability } from '@/utils/booking/slotPipeline'
import { getAvailabilitySettings, type BusinessHoursConfig } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { useLocalTime } from '@/composables/useLocalTime'
import { toRFC3339DateTime, type RFC3339DateTime } from '@/types/datetime'
import { findEventFinalByName } from '@/utils/booking/appointmentSlotBuilder'
import { getMajorEventShape } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import { useGlobal } from '@/composables/useGlobal'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

const logger = createLogger('useMoveablePartsScheduling')

const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
  return 'hours' in config
}

interface UseMoveablePartsSchedulingParams {
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedSlot: ComputedRef<AppointmentSlot | null>
}

/**
 * Helper function to format day label
 * LEARNING: Uses useLocalTime composable for UI-boundary date formatting
 * WHY: All local time conversions must go through useLocalTime composable
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
 * Helper function to format time label
 * LEARNING: Uses useLocalTime composable for UI-boundary time formatting
 * WHY: All local time conversions must go through useLocalTime composable
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
  const { getGlobalData } = useGlobal()
  const { settings } = useAvailabilitySettings()
  
  const showModal = ref(false)
  
  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  
  const selectedSlotIndex = ref<number | null>(null)
  
  // Moveable options (computed via watchEffect since it's async)
  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  
  const hasMoveableParts = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return false
    const moveableEventFinal = findEventFinalByName(shape.slotShape, 'Moveable')
    const moveableDuration = moveableEventFinal?.roundedDuration ?? 0
    return moveableDuration > 0
  })
  
  const moveableDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    const moveableEventFinal = findEventFinalByName(shape.slotShape, 'Moveable')
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
    
    // PATTERN: Find major event shape using attendee-based logic, then use its name to look up time range
    let majorTimeRange: import('@/types/appointment').TimeRange | null = null
    const globalData = getGlobalData()
    if (globalData && settings.value?.differentialPerspectives && slot.shape.slotShape.eventFinals.length > 0) {
      const majorAttendeeIds = settings.value.differentialPerspectives.majorAttendees || []
      if (majorAttendeeIds.length > 0) {
        const eventShapeEntities = slot.shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
        const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
        if (majorEventShape) {
          const majorEventName = majorEventShape.name
          majorTimeRange = slot.eventTimeRanges?.[majorEventName] ?? null
        }
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
      
      const settings = await getAvailabilitySettings()
      
      // LEARNING: Extract businessHours from structured rangeConstraints
      // WHY: No top-level businessHours fallback - must use structured format
      // PATTERN: Get businessHours from rangeConstraints.businessHours.config.hours
      const businessHoursConfig = settings.rangeConstraints?.businessHours?.config
      const businessHours = businessHoursConfig && isBusinessHoursConfig(businessHoursConfig)
        ? businessHoursConfig.hours
        : null
      if (!businessHours) {
        throw new Error('businessHours must be provided in rangeConstraints.businessHours.config.hours')
      }
      
      const result = computeSlotAvailability({
        startBoundary: innerBoundary,
        endBoundary: outerBoundary,
        duration,
        businessHours,
        minuteIncrement: settings.minuteIncrement,
        includeFlags: { major: false, minor: false, moveable: true }
      }, [])
      
      const availableSlots: MoveableSlot[] = result.slots.filter(slot => slot.isAvailable).map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        dayLabel: formatDayLabel(slot.startTime, formatDateForDisplay),
        timeLabel: formatTimeLabel(slot.startTime, slot.endTime, formatTimeForDisplay)
      }))
      
      moveableOptions.value = {
        innerBoundary,
        outerBoundary,
        moveableDuration: duration,
        availableSlots,
        earliestCompletion: result.earliestCompletion ?? outerBoundary,
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
