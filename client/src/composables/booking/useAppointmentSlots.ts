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
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('useAppointmentSlots')

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
      logger.error('Error building appointment shape:', error)
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
      
      // LEARNING: Log availability map and times for comparison
      // WHY: Helps verify that Map keys match the time values being looked up
      // PATTERN: Log sample values from both sources to compare formats
      if (times.length > 0 && availabilityMap) {
        const sampleTimes = times.slice(0, 5)
        const sampleMapKeys = Array.from(availabilityMap.keys()).slice(0, 5)
        logger.debug('Comparing times vs Map keys:', {
          timesCount: times.length,
          mapSize: availabilityMap.size,
          sampleTimes,
          sampleMapKeys,
          firstTimeMatches: times[0] === sampleMapKeys[0],
          firstTimeInMap: availabilityMap.has(times[0]),
          sampleMatches: sampleTimes.map(time => ({
            time,
            inMap: availabilityMap.has(time),
            matchingKey: sampleMapKeys.find(key => key === time)
          }))
        })
      }
      
      const slots = times.map((time, index) => {
        // Get fallback duration from time slot if shape duration is 0
        const fallbackDuration = durations?.get(time)
        
        // LEARNING: Set availability status from availability map
        // WHY: Marks slots as available/busy based on calendar busy periods
        // PATTERN: Check availability map, default to true if not found (backward compatibility)
        const isAvailable = availabilityMap?.get(time) ?? true
        
        // LEARNING: Log first few slots to verify lookup
        // WHY: Helps debug why busy slots aren't being marked correctly
        // PATTERN: Log sample lookups to verify Map keys match time values
        // NOTE: Debug logging disabled by default - enable via VITE_DEBUG_SCOPES=useAppointmentSlots if needed
        if (index < 10) {
          // Unused in commented-out debug logging - kept for potential future debugging
          // const busyEntries = availabilityMap ? Array.from(availabilityMap.entries()).filter(([_, isAvail]) => !isAvail) : []
          // const busyTimes = busyEntries.map(([time, _]) => time)
          // Debug logging disabled by default - enable via VITE_DEBUG_SCOPES=useAppointmentSlots if needed
          // logger.debug('Slot lookup:', {
          //   index,
          //   time,
          //   mapHasKey: availabilityMap?.has(time),
          //   isAvailable,
          //   mapSize: availabilityMap?.size,
          //   busyTimesCount: busyTimes.length,
          //   isTimeInBusyList: busyTimes.includes(time),
          //   sampleBusyTimes: busyTimes.slice(0, 5),
          //   sampleKeys: availabilityMap ? Array.from(availabilityMap.keys()).slice(0, 5) : []
          // })
        }
        
        // LEARNING: Derive buttonIndex from array position (index parameter from map)
        // WHY: Ensures buttonIndex always matches UI grid position - single source of truth
        // PATTERN: Pass map index directly to builder, which uses it as buttonIndex
        // NOTE: index is the array position, which becomes slot.buttonIndex in applyShapeToTime
        const slot = applyShapeToTime(shape, time, index, fallbackDuration, isAvailable)
        
        return slot
      })
      
      return slots
    } catch (error) {
      logger.error('Error applying shape to times:', error)
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
