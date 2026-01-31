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
import { fitAvailableTimeSlots } from '@/utils/booking/timeSlotFitter'  // P3-6: Renamed for clarity
import { getAvailabilitySettings, type BusinessHoursConfig } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { useLocalTime } from '@/composables/useLocalTime'
import { toRFC3339DateTime, type RFC3339DateTime } from '@/types/datetime'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
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
  // WHY: All local time conversions must go through useLocalTime
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
  
  // Modal visibility state
  const showModal = ref(false)
  
  // User's contingency preferences
  const contingencyPeriod = ref<ContingencyPeriod>({ ...DEFAULT_CONTINGENCY })
  
  // Selected slot index
  const selectedSlotIndex = ref<number | null>(null)
  
  // Moveable options (computed via watchEffect since it's async)
  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  
  // Detection: does current appointment have moveable parts?
  // Session Event Refactor: Use eventDurations Record instead of hardcoded properties
  const hasMoveableParts = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return false
    const moveableDuration = shape.slotShape.eventDurations?.['Moveable'] ?? 0
    return moveableDuration > 0
  })
  
  // Moveable duration from shape
  // Session Event Refactor: Use eventDurations Record instead of hardcoded properties
  const moveableDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    return shape.slotShape.eventDurations?.['Moveable'] ?? 0
  })
  
  // Calculate available slots using fitTimeSlots
  // LEARNING: Use watchEffect for async operations
  // WHY: Computed properties can't be async, so we use watchEffect to update a ref
  // PATTERN: Watch dependencies and update ref when they change
  watchEffect(async () => {
    if (!hasMoveableParts.value || !selectedSlot.value) {
      moveableOptions.value = null
      return
    }
    
    const slot = selectedSlot.value
    const duration = moveableDuration.value
    
    // Inner boundary: end of on-site work
    // Session Event Refactor: Use eventTimeRanges Record instead of hardcoded properties
    const onSiteTimeRange = slot.eventTimeRanges?.['OnSite']
    const innerBoundary = onSiteTimeRange?.endTime ?? slot.totalTimeRange?.endTime
    if (!innerBoundary) {
      moveableOptions.value = null
      return
    }
    
    try {
      isLoadingOptions.value = true
      
      // Outer boundary: contingency deadline or default
      // LEARNING: Use UTC methods for date manipulation
      // WHY: All business logic should use UTC to avoid timezone issues
      let outerBoundary: RFC3339DateTime
      if (contingencyPeriod.value.hasContingency && contingencyPeriod.value.endDate) {
        // Parse date string (YYYY-MM-DD format)
        const [year, month, day] = contingencyPeriod.value.endDate.split('-').map(Number)
        if (contingencyPeriod.value.endTime) {
          const [hours, minutes] = contingencyPeriod.value.endTime.split(':').map(Number)
          // LEARNING: Use Date.UTC() to create date in UTC
          const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0))
          outerBoundary = toRFC3339DateTime(date)
        } else {
          // Default to 5pm UTC
          const date = new Date(Date.UTC(year, month - 1, day, 17, 0, 0, 0))
          outerBoundary = toRFC3339DateTime(date)
        }
      } else {
        // Default: N days after appointment
        const innerBoundaryDate = new Date(innerBoundary)
        const defaultDate = new Date(Date.UTC(
          innerBoundaryDate.getUTCFullYear(),
          innerBoundaryDate.getUTCMonth(),
          innerBoundaryDate.getUTCDate() + DEFAULT_OUTER_BOUNDARY_DAYS,
          17, 0, 0, 0
        ))
        outerBoundary = toRFC3339DateTime(defaultDate)
      }
      
      // Get business hours
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
      
      // Fit moveable work into available time
      const result = await fitAvailableTimeSlots({  // P3-6: Renamed for clarity
        startBoundary: innerBoundary,
        endBoundary: outerBoundary,
        duration,
        businessHours,
        minuteIncrement: settings.minuteIncrement,
        includeFlags: { onSite: false, clientPresent: false, moveable: true }
      })
      
      // Transform to MoveableSlot format with labels
      const availableSlots: MoveableSlot[] = result.slots.map((slot) => ({
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
  
  // Selected moveable slot (computed from index)
  const selectedMoveableSlot = computed<MoveableSlot | null>(() => {
    if (selectedSlotIndex.value === null || !moveableOptions.value) {
      return null
    }
    return moveableOptions.value.availableSlots[selectedSlotIndex.value] ?? null
  })
  
  // Actions
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
    // State
    showModal,
    contingencyPeriod,
    selectedSlotIndex,
    isLoadingOptions,
    
    // Computed
    hasMoveableParts,
    moveableDuration,
    moveableOptions: computed(() => moveableOptions.value),
    selectedMoveableSlot,
    
    // Actions
    openModal,
    closeModal,
    selectSlot,
    resetContingency
  }
}
