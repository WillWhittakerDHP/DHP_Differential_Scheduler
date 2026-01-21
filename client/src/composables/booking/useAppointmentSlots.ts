/**
 * useAppointmentSlots Composable
 * 
 * LEARNING: Thin orchestrator for AppointmentShape and AppointmentSlot
 * WHY: Separates shape calculation (once) from slot application (per available time)
 * PATTERN: Composable that builds shape once, applies to each available time
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { 
  AppointmentShape, 
  AppointmentSlot, 
  AppointmentSlots, 
  TimeRange,
  PerspectiveKey 
} from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { 
  buildAppointmentShape, 
  applyShapeToTime, 
  derivePerspective 
} from '@/utils/booking/appointmentSlotBuilder'

/**
 * useAppointmentSlots composable parameters
 */
export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
  availableStartTimes: ComputedRef<string[]>
  slotAvailability?: ComputedRef<Map<string, boolean>> // Optional: map of startTime -> isAvailable
  timeSlotDurations?: ComputedRef<Map<string, number>> // Optional: durations from time slots for fallback
  selectedButtonIndex: Ref<number | null>
  perspective: ComputedRef<PerspectiveKey>
  isDifferentialService: ComputedRef<boolean>
}

/**
 * useAppointmentSlots composable return type
 */
export interface UseAppointmentSlotsReturn {
  // Shape (memoized, calculated once when blockInstances change)
  appointmentShape: ComputedRef<AppointmentShape | null>
  
  // Slots (shape applied to each available time)
  appointmentSlots: ComputedRef<AppointmentSlots>
  
  // Selected slot (or null)
  selectedSlot: ComputedRef<AppointmentSlot | null>
  
  // Helper to get display time for a slot (perspective-derived)
  getDisplayTime: (buttonIndex: number) => TimeRange | null
  
  // Graph bar data (convenience wrapper around selectedSlot totals)
  // When selectedSlot is null, returns { onSite: null, clientPresent: null }
  graphBars: ComputedRef<{
    onSite: TimeRange | null      // "Inspector" bar
    clientPresent: TimeRange | null // "Client" bar (null if non-differential)
  }>
}

/**
 * useAppointmentSlots composable
 * 
 * LEARNING: Builds shape once, applies to each available time
 * WHY: Efficient - durations calculated once, times applied N times
 * PATTERN: Composable that orchestrates pure utility functions
 */
export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
  const {
    blockInstances,
    availableStartTimes,
    slotAvailability,
    timeSlotDurations,
    selectedButtonIndex,
    perspective,
    isDifferentialService
  } = params

  // Build shape when blockInstances change (memoized)
  const appointmentShape = computed(() => {
    const instances = blockInstances.value
    
    if (instances.length === 0) {
      return null
    }
    
    try {
      const shape = buildAppointmentShape(instances)
      return shape
    } catch (error) {
      console.error('Error building appointment shape:', error)
      return null
    }
  })

  // Apply shape to each available time
  // LEARNING: Use time slot duration as fallback if shape duration is 0
  // WHY: If services have 0 baseTime, use time slot duration to ensure valid time ranges
  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return []
    }
    
    const times = availableStartTimes.value
    if (times.length === 0) {
      return []
    }
    
    const durations = timeSlotDurations?.value
    
    try {
      const availabilityMap = slotAvailability?.value
      
      const slots = times.map((time, index) => {
        // Get fallback duration from time slot if shape duration is 0
        const fallbackDuration = durations?.get(time)
        const slot = applyShapeToTime(shape, time, index, fallbackDuration)
        
        // LEARNING: Set availability status from availability map
        // WHY: Marks slots as available/busy based on calendar busy periods
        // PATTERN: Check availability map, default to true if not found (backward compatibility)
        const isAvailable = availabilityMap?.get(time) ?? true
        
        return {
          ...slot,
          isAvailable
        }
      })
      
      return slots
    } catch (error) {
      console.error('Error applying shape to times:', error)
      return []
    }
  })

  // Derive selected slot
  const selectedSlot = computed(() => {
    const index = selectedButtonIndex.value
    if (index === null) return null
    
    return appointmentSlots.value.find(s => s.buttonIndex === index) ?? null
  })

  // Helper to get display time for a slot (perspective-derived)
  // LEARNING: Return a function that reads perspective.value each time it's called
  // WHY: Ensures the function always uses current perspective value
  // NOTE: The function itself is stable, but reads reactive perspective.value on each call
  const getDisplayTime = (buttonIndex: number): TimeRange | null => {
    const slot = appointmentSlots.value.find(s => s.buttonIndex === buttonIndex)
    if (!slot) return null
    
    // LEARNING: Read perspective.value each time function is called
    // WHY: Ensures we always use the current perspective value
    return derivePerspective(slot, perspective.value)
  }

  // Graph bar data
  const graphBars = computed(() => {
    const slot = selectedSlot.value
    if (!slot) {
      return { onSite: null, clientPresent: null }
    }
    
    return {
      onSite: slot.totalOnSite,
      clientPresent: isDifferentialService.value ? slot.totalClientPresent : null
    }
  })

  return {
    appointmentShape,
    appointmentSlots,
    selectedSlot,
    getDisplayTime,
    graphBars
  }
}
