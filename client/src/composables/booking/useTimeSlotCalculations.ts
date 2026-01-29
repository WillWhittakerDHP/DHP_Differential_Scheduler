/**
 * useTimeSlotCalculations Composable
 * 
 * LEARNING: Extracts time slot calculation logic from AvailabilityStep component
 * WHY: Moves duration calculations and time block formatting to composable
 * PATTERN: Composable that provides computed properties for time calculations
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import {
  createFinalizedParts,
  filterZeroedParts
} from '@/utils/booking/partShapeAggregator'
import { useLocalTime } from '@/composables/useLocalTime'
import { toRFC3339DateTime } from '@/types/datetime'
import { useDurationRounding } from '@/composables/booking/useDurationRounding'

/**
 * Time block structure for display
 */
export interface TimeBlock {
  label: string
  duration: string
  timeBlock: string | null
}

/**
 * Time on site blocks structure
 */
export interface TimeOnSiteBlocks {
  inspector: TimeBlock
  client: TimeBlock | null
}

/**
 * useTimeSlotCalculations composable parameters
 */
export interface UseTimeSlotCalculationsParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  }
  inspectorTimeSlot: Ref<TimeSlot | null>
  clientTimeSlot: Ref<TimeSlot | null>
  isDifferentialService: ComputedRef<boolean>
}

/**
 * useTimeSlotCalculations composable return type
 */
export interface UseTimeSlotCalculationsReturn {
  onSiteTotal: ComputedRef<number>
  presentationDuration: ComputedRef<number>
  timeOnSiteBlocks: ComputedRef<TimeOnSiteBlocks>
}

/**
 * useTimeSlotCalculations composable
 * 
 * LEARNING: Provides computed properties for time slot duration calculations
 * WHY: Extracts calculation logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useTimeSlotCalculations(params: UseTimeSlotCalculationsParams): UseTimeSlotCalculationsReturn {
  const {
    wizard,
    inspectorTimeSlot,
    clientTimeSlot,
    isDifferentialService
  } = params

  const { formatDuration } = useTimeFormatting()
  const { formatTimeRangeForDisplay } = useLocalTime()
  
  // LEARNING: Get rounding function from composable
  // WHY: Provides reactive rounding that respects availability settings
  // PATTERN: Use composable for rounding logic
  const { roundDuration } = useDurationRounding()

  /**
   * Filter out parts from zeroed finalized parts
   * LEARNING: Creates finalized parts and filters out zeroed parts
   * WHY: Zeroed parts should not contribute to duration calculations
   * PATTERN: Group by part shape, create finalized parts, filter zeroed, extract source parts
   */
  const getNonZeroedParts = (parts: BookingPartInstance[]): BookingPartInstance[] => {
    const finalizedParts = createFinalizedParts(parts)
    const nonZeroedFinalizedParts = filterZeroedParts(finalizedParts)
    
    // Extract source part instances from non-zeroed finalized parts
    return nonZeroedFinalizedParts.flatMap(fp => fp.sourcePartInstances)
  }

  /**
   * LEARNING: Calculate on-site total with configurable rounding
   * WHY: Sum of all part instances' baseTime where onSite = true across all selected services
   * PATTERN: Sum across all selected services, filter part instances by onSite, sum baseTime values, then apply rounding
   * NOTE: Excludes parts from zeroed categories, applies rounding based on availability settings
   */
  const onSiteTotal = computed(() => {
    if (wizard.selectedServiceTypeBlocks.value.length === 0) return 0
    
    // Sum across all selected services
    const unroundedTotal = wizard.selectedServiceTypeBlocks.value.reduce((total, service) => {
      if (!service?.partInstances || service.partInstances.length === 0) return total
      
      // LEARNING: Filter out zeroed categories before calculating onSite total
      // WHY: Zeroed categories should not contribute to duration
      const nonZeroedParts = getNonZeroedParts(service.partInstances)
      
      // LEARNING: Filter by onSite=true first, but fallback to all if none found
      // WHY: Some services might not have onSite flag set correctly
      // PATTERN: Try filtered first, fallback to all if result is 0
      const onSiteParts = nonZeroedParts.filter(pi => pi.onSite === true)
      const onSiteSum = onSiteParts.reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
      
      // LEARNING: Fallback to all part instances if no onSite parts found
      // WHY: Ensures we always have a duration to display
      // PATTERN: Return onSiteSum if > 0, otherwise sum all baseTime
      if (onSiteSum > 0) {
        return total + onSiteSum
      }
      
      // Fallback: sum all baseTime values from non-zeroed parts
      return total + nonZeroedParts.reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
    }, 0)
    
    // LEARNING: Apply configurable rounding based on availability settings
    // WHY: Allows admin to control rounding behavior via Business Controls tab
    // PATTERN: Use composable rounding function that respects settings
    return roundDuration(unroundedTotal)
  })

  /**
   * WHY: Sum of all part instances' baseTime where clientPresent = true across all selected services
   * PATTERN: Sum across all selected services, filter part instances by clientPresent, sum baseTime values
   * NOTE: Excludes parts from zeroed categories
   */
  const presentationDuration = computed(() => {
    if (wizard.selectedServiceTypeBlocks.value.length === 0) return 0
    
    // Sum across all selected services
    return wizard.selectedServiceTypeBlocks.value.reduce((total, service) => {
      if (!service?.partInstances || service.partInstances.length === 0) return total
      
      // LEARNING: Filter out zeroed categories before calculating presentation duration
      // WHY: Zeroed categories should not contribute to duration
      const nonZeroedParts = getNonZeroedParts(service.partInstances)
      
      return total + nonZeroedParts
        .filter(pi => pi.clientPresent === true)
        .reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
    }, 0)
  })

  /**
   * LEARNING: Calculate time blocks for Time On-Site Graph
   * WHY: Shows inspector and client time ranges when time slot is selected
   * PATTERN: Calculate from selected time slot and durations
   * NOTE: 'Inspector' and 'Client' are UI labels for differential scheduling roles, not hardcoded instance names
   */
  const timeOnSiteBlocks = computed(() => {
    if (!inspectorTimeSlot.value) {
      // LEARNING: No time selected - show total durations
      // WHY: Shows total time requirements before time selection
      // PATTERN: Return total durations when no time selected
      // NOTE: Labels represent scheduling roles (inspector arrival vs client presentation), not specific block instances
      return {
        inspector: {
          label: 'Inspector',
          duration: formatDuration(onSiteTotal.value),
          timeBlock: null
        },
        client: isDifferentialService.value ? {
          label: 'Client Formal Presentation',
          duration: formatDuration(presentationDuration.value),
          timeBlock: null
        } : null
      }
    }
    
    // LEARNING: Time selected - calculate time blocks
    // WHY: Shows actual time ranges when time slot is selected
    // PATTERN: Calculate start and end times from selected slot and durations
    const inspectorStart = new Date(inspectorTimeSlot.value.startTime)
    const inspectorEnd = new Date(inspectorStart.getTime() + onSiteTotal.value * 60 * 1000)
    
    // LEARNING: Format time block range
    // WHY: Displays time range in readable format
    // PATTERN: Format start and end times, combine with arrow
    const formatTimeBlock = (start: Date, end: Date): string => {
      // LEARNING: Use composable for UI-boundary formatting
      // WHY: All local time conversions must go through useLocalTime composable
      // WHY: Create proper TimeRange object with duration calculated from start/end times
      const startTime = toRFC3339DateTime(start)
      const endTime = toRFC3339DateTime(end)
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
      return formatTimeRangeForDisplay({
        startTime,
        endTime,
        duration
      })
    }
    
    const inspectorTimeBlock = formatTimeBlock(inspectorStart, inspectorEnd)
    
    // LEARNING: For differential services, calculate client time block
    // WHY: Shows client presentation time range separately
    // PATTERN: Use client time slot if available, otherwise use inspector end time as client start
    let clientTimeBlock: string | null = null
    if (isDifferentialService.value && clientTimeSlot.value) {
      const clientStart = new Date(clientTimeSlot.value.startTime)
      const clientEnd = new Date(clientStart.getTime() + presentationDuration.value * 60 * 1000)
      clientTimeBlock = formatTimeBlock(clientStart, clientEnd)
    } else if (isDifferentialService.value) {
      // LEARNING: Use inspector end time as client start time
      // WHY: Client presentation starts when inspector finishes
      // PATTERN: Calculate client end from inspector end + presentation duration
      const clientStart = inspectorEnd
      const clientEnd = new Date(clientStart.getTime() + presentationDuration.value * 60 * 1000)
      clientTimeBlock = formatTimeBlock(clientStart, clientEnd)
    }
    
    return {
      inspector: {
        label: 'Inspector',
        duration: formatDuration(onSiteTotal.value),
        timeBlock: inspectorTimeBlock
      },
      client: isDifferentialService.value ? {
        label: 'Client Formal Presentation',
        duration: formatDuration(presentationDuration.value),
        timeBlock: clientTimeBlock
      } : null
    }
  })

  return {
    onSiteTotal,
    presentationDuration,
    timeOnSiteBlocks
  }
}

