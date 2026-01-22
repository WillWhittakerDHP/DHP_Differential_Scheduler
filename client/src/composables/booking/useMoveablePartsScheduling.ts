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
import { fitAvailableTimeSlots, type BusinessHoursMap } from '@/utils/booking/timeSlotFitter'  // P3-6: Renamed for clarity
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('useMoveablePartsScheduling')

interface UseMoveablePartsSchedulingParams {
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedSlot: ComputedRef<AppointmentSlot | null>
}

/**
 * Helper function to format day label
 */
function formatDayLabel(isoDate: string): string {
  const date = new Date(isoDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  
  if (dateOnly.getTime() === today.getTime()) return 'Today'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Helper function to format time label
 */
function formatTimeLabel(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  return `${formatTime(start)} - ${formatTime(end)}`
}

export function useMoveablePartsScheduling(params: UseMoveablePartsSchedulingParams) {
  const { appointmentShape, selectedSlot } = params
  
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
  const hasMoveableParts = computed(() => {
    const shape = appointmentShape.value
    return shape !== null && shape.totalMoveableDuration > 0
  })
  
  // Moveable duration from shape
  const moveableDuration = computed(() => {
    return appointmentShape.value?.totalMoveableDuration ?? 0
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
    const innerBoundary = slot.totalOnSite?.endTime ?? slot.totalTime?.endTime
    if (!innerBoundary) {
      moveableOptions.value = null
      return
    }
    
    try {
      isLoadingOptions.value = true
      
      // Outer boundary: contingency deadline or default
      let outerBoundary: string
      if (contingencyPeriod.value.hasContingency && contingencyPeriod.value.endDate) {
        const date = new Date(contingencyPeriod.value.endDate)
        if (contingencyPeriod.value.endTime) {
          const [hours, minutes] = contingencyPeriod.value.endTime.split(':').map(Number)
          date.setHours(hours, minutes, 0, 0)
        } else {
          date.setHours(17, 0, 0, 0) // Default to 5pm
        }
        outerBoundary = date.toISOString()
      } else {
        // Default: N days after appointment
        const defaultDate = new Date(innerBoundary)
        defaultDate.setDate(defaultDate.getDate() + DEFAULT_OUTER_BOUNDARY_DAYS)
        defaultDate.setHours(17, 0, 0, 0)
        outerBoundary = defaultDate.toISOString()
      }
      
      // Get business hours
      const settings = await getAvailabilitySettings()
      
      // Fit moveable work into available time
      const result = fitAvailableTimeSlots({  // P3-6: Renamed for clarity
        startBoundary: innerBoundary,
        endBoundary: outerBoundary,
        duration,
        businessHours: settings.businessHours as BusinessHoursMap,
        minuteIncrement: settings.minuteIncrement,
        includeFlags: { onSite: false, clientPresent: false, moveable: true }
      })
      
      // Transform to MoveableSlot format with labels
      const availableSlots: MoveableSlot[] = result.slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        dayLabel: formatDayLabel(slot.startTime),
        timeLabel: formatTimeLabel(slot.startTime, slot.endTime)
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
