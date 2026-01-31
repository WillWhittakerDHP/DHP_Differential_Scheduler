/**
 * useTimeSlotCalculations Composable
 * 
 * LEARNING: Extracts time slot calculation logic from AvailabilityStep component
 * WHY: Moves duration calculations and time block formatting to composable
 * PATTERN: Composable that provides computed properties for time calculations
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot, AppointmentShape } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useLocalTime } from '@/composables/useLocalTime'
import { toRFC3339DateTime } from '@/types/datetime'
import { useDurationRounding } from '@/composables/booking/useDurationRounding'
import { findEventFinalByName } from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

/**
 * Time block structure for display
 */
interface TimeBlock {
  label: string
  duration: string
  timeBlock: string | null
}

/**
 * Time on site blocks structure
 * NOTE: Property names 'major' and 'minor' kept for backward compatibility, but represent major/minor perspectives
 */
export interface DifferentialTimeBlocks {
  major: TimeBlock  // Major perspective (legacy name)
  minor: TimeBlock | null  // Minor perspective (legacy name)
}

/**
 * useTimeSlotCalculations composable parameters
 */
interface UseTimeSlotCalculationsParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  }
  appointmentShape: ComputedRef<AppointmentShape | null>
  majorTimeSlot: Ref<TimeSlot | null>
  minorTimeSlot: Ref<TimeSlot | null>
  isDifferentialService: ComputedRef<boolean>
}

/**
 * useTimeSlotCalculations composable return type
 */
interface UseTimeSlotCalculationsReturn {
  majorDuration: ComputedRef<number>
  minorDuration: ComputedRef<number>
  differentialTimeBlocks: ComputedRef<DifferentialTimeBlocks>
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
    appointmentShape,
    majorTimeSlot,
    minorTimeSlot,
    isDifferentialService
  } = params

  const { formatDuration } = useTimeFormatting()
  const { formatTimeRangeForDisplay } = useLocalTime()
  
  // LEARNING: Get rounding function from composable
  // WHY: Provides reactive rounding that respects availability settings
  // PATTERN: Use composable for rounding logic
  const { roundDuration } = useDurationRounding()
  
  // LEARNING: Get availability settings for configured labels
  // WHY: Labels are configurable in admin panel, need to use configured values
  // PATTERN: Use composable to access reactive settings
  const { settings: availabilitySettings } = useAvailabilitySettings()
  
  // LEARNING: Get configured labels with fallback to defaults
  // WHY: Provides configurable labels with sensible defaults
  // PATTERN: Computed properties that read from settings with fallback
  const majorLabel = computed(() => 
    availabilitySettings.value?.differentialPerspectives?.majorLabel || 'Inspector'
  )
  const minorLabel = computed(() => 
    availabilitySettings.value?.differentialPerspectives?.minorLabel || 'Client Formal Presentation'
  )

  /**
   * LEARNING: Get major event total from SlotShape (source of truth)
   * WHY: SlotShape already contains calculated major event duration, no need to filter raw parts
   * PATTERN: Use helper function to find major event, apply rounding
   * NOTE: Applies rounding based on availability settings
   * NOTE: Uses 'Major' as fallback for backward compatibility, but should use major event from availabilitySettings
   * Session Event Refactor: Use eventFinals array with helper function instead of hardcoded Record access
   */
  const majorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    
    const majorEventFinal = findEventFinalByName(shape.slotShape, 'Major')
    const unroundedTotal = majorEventFinal?.duration ?? 0
    
    // LEARNING: Apply configurable rounding based on availability settings
    // WHY: Allows admin to control rounding behavior via Business Controls tab
    // PATTERN: Use composable rounding function that respects settings
    return roundDuration(unroundedTotal)
  })

  /**
   * LEARNING: Get minor event duration from SlotShape (source of truth)
   * WHY: SlotShape already contains calculated minor event duration, no need to filter raw parts
   * PATTERN: Use helper function to find minor event
   * NOTE: Uses 'Minor' as fallback for backward compatibility, but should use minor event from availabilitySettings
   * Session Event Refactor: Use eventFinals array with helper function instead of hardcoded Record access
   */
  const minorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    
    const minorEventFinal = findEventFinalByName(shape.slotShape, 'Minor')
    return minorEventFinal?.duration ?? 0
  })

  /**
   * LEARNING: Calculate time blocks for Time On-Site Graph
   * WHY: Shows major and minor time ranges when time slot is selected
   * PATTERN: Calculate from selected time slot and durations
   * NOTE: 'Inspector' and 'Client' are UI labels for differential scheduling roles, not hardcoded instance names
   */
  const differentialTimeBlocks = computed(() => {
    if (!majorTimeSlot.value) {
      // LEARNING: No time selected - show total durations
      // WHY: Shows total time requirements before time selection
      // PATTERN: Return total durations when no time selected
      // NOTE: Labels represent scheduling roles (major arrival vs minor presentation), not specific block instances
      return {
        major: {
          label: majorLabel.value,
          duration: formatDuration(majorDuration.value),
          timeBlock: null
        },
        minor: isDifferentialService.value ? {
          label: minorLabel.value,
          duration: formatDuration(minorDuration.value),
          timeBlock: null
        } : null
      }
    }
    
    // LEARNING: Time selected - calculate time blocks
    // WHY: Shows actual time ranges when time slot is selected
    // PATTERN: Calculate start and end times from selected slot and durations
    const majorStart = new Date(majorTimeSlot.value.startTime)
    const majorEnd = new Date(majorStart.getTime() + majorDuration.value * 60 * 1000)
    
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
    
    const majorTimeBlock = formatTimeBlock(majorStart, majorEnd)

    // LEARNING: For differential services, calculate minor time block
    // WHY: Shows minor presentation time range separately
    // PATTERN: Use minor time slot if available, otherwise use major end time as minor start
    let minorTimeBlock: string | null = null
    if (isDifferentialService.value && minorTimeSlot.value) {
      const minorStart = new Date(minorTimeSlot.value.startTime)
      const minorEnd = new Date(minorStart.getTime() + minorDuration.value * 60 * 1000)
      minorTimeBlock = formatTimeBlock(minorStart, minorEnd)
    } else if (isDifferentialService.value) {
      // LEARNING: Use major end time as minor start time
      // WHY: Minor presentation starts when major finishes
      // PATTERN: Calculate minor end from major end + presentation duration
      const minorStart = majorEnd
      const minorEnd = new Date(minorStart.getTime() + minorDuration.value * 60 * 1000)
      minorTimeBlock = formatTimeBlock(minorStart, minorEnd)
    }

    return {
      major: {
        label: majorLabel.value,
        duration: formatDuration(majorDuration.value),
        timeBlock: majorTimeBlock
      },
      minor: isDifferentialService.value ? {
        label: minorLabel.value,
        duration: formatDuration(minorDuration.value),
        timeBlock: minorTimeBlock
      } : null
    }
  })

  return {
    majorDuration,
    minorDuration,
    differentialTimeBlocks
  }
}

