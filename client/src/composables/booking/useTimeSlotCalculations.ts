/**
 * useTimeSlotCalculations Composable
 * 
 * LEARNING: Extracts time slot calculation logic from AvailabilityStep component
 * WHY: Moves duration calculations and time block formatting to composable
 * PATTERN: Composable that provides computed properties for time calculations
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import { createLogger } from '@/utils/logger'
import type { EventFinal, TimeSlot, AppointmentShape } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useLocalTime } from '@/composables/useLocalTime'
import { toRFC3339DateTime } from '@/types/datetime'
import { findEventFinalByName } from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useGlobal } from '@/composables/useGlobal'
import { getMajorEventShape, getMinorEventShape } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'

const logger = createLogger('useTimeSlotCalculations')

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

interface UseTimeSlotCalculationsParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  }
  appointmentShape: ComputedRef<AppointmentShape | null>
  majorTimeSlot: Ref<TimeSlot | null>
  minorTimeSlot: Ref<TimeSlot | null>
  isDifferentialService: ComputedRef<boolean>
}

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
  
  // PATTERN: Use composable to access reactive settings
  const { settings: availabilitySettings } = useAvailabilitySettings()
  const { getGlobalData } = useGlobal()
  
  const majorLabel = computed(() => {
    const label = availabilitySettings.value?.differentialPerspectives?.majorLabel
    if (label === undefined || label === null || label === '') {
      logger.debug('Time slot: missing majorLabel in settings, using default', { scope: 'differentialPerspectives' })
      return 'Inspector'
    }
    return label
  })
  const minorLabel = computed(() => {
    const label = availabilitySettings.value?.differentialPerspectives?.minorLabel
    if (label === undefined || label === null || label === '') {
      logger.debug('Time slot: missing minorLabel in settings, using default', { scope: 'differentialPerspectives' })
      return 'Client Formal Presentation'
    }
    return label
  })

  /**
   * LEARNING: Get major event total from SlotShape (source of truth)
   * WHY: SlotShape already contains calculated major event duration, no need to filter raw parts
   * PATTERN: Use attendee-based logic to find major event, fall back to 'Major' name if settings unavailable
   * DUAL-TRACK: Use roundedDuration - rounding already computed at event level
   */
  const majorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    
    const globalData = getGlobalData()
    const settings = availabilitySettings.value
    
    // PATTERN: Use attendee-based logic when available
    let majorEventFinal: EventFinal | undefined
    if (globalData && settings?.differentialPerspectives && shape.slotShape.eventFinals.length > 0) {
      let majorAttendeeIds = settings.differentialPerspectives.majorAttendees
      if (majorAttendeeIds === undefined || majorAttendeeIds === null) {
        logger.debug('Time slot: majorAttendees missing, using []')
        majorAttendeeIds = []
      }
      if (majorAttendeeIds.length > 0) {
        const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
        const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
        if (majorEventShape) {
          majorEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id)
        }
      }
    }
    
    // PATTERN: Fall back to name-based lookup if attendee-based logic didn't find event
    if (!majorEventFinal) {
      majorEventFinal = findEventFinalByName(shape.slotShape, 'Major')
    }
    
    if (majorEventFinal === undefined) {
      logger.debug('Time slot: no major event final found, duration 0')
      return 0
    }
    const duration = majorEventFinal.roundedDuration
    return duration !== undefined && duration !== null ? duration : 0
  })

  /**
   * LEARNING: Get minor event duration from SlotShape (source of truth)
   * WHY: SlotShape already contains calculated minor event duration, no need to filter raw parts
   * PATTERN: Use attendee-based logic to find minor event, fall back to 'Minor' name if settings unavailable
   * DUAL-TRACK: Use roundedDuration - rounding already computed at event level
   */
  const minorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return 0
    
    const globalData = getGlobalData()
    const settings = availabilitySettings.value
    
    // PATTERN: Use attendee-based logic when available
    let minorEventFinal: EventFinal | undefined
    if (globalData && settings?.differentialPerspectives && shape.slotShape.eventFinals.length > 0) {
      let majorAttendeeIds = settings.differentialPerspectives.majorAttendees
      if (majorAttendeeIds === undefined || majorAttendeeIds === null) {
        logger.debug('Time slot: majorAttendees missing (minor calc), using []')
        majorAttendeeIds = []
      }
      let minorAttendeeIds = settings.differentialPerspectives.minorAttendees
      if (minorAttendeeIds === undefined || minorAttendeeIds === null) {
        logger.debug('Time slot: minorAttendees missing, using []')
        minorAttendeeIds = []
      }

      // PATTERN: Exclude major event when finding minor event
      const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
      const majorEventShape = majorAttendeeIds.length > 0
        ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
        : null
      const eventShapesExcludingMajor = majorEventShape
        ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
        : eventShapeEntities
      
      if (minorAttendeeIds.length > 0) {
        const minorEventShape = getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
        if (minorEventShape) {
          minorEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === minorEventShape.id)
        }
      }
    }
    
    // PATTERN: Fall back to name-based lookup if attendee-based logic didn't find event
    if (!minorEventFinal) {
      minorEventFinal = findEventFinalByName(shape.slotShape, 'Minor')
    }
    
    if (minorEventFinal === undefined) {
      logger.debug('Time slot: no minor event final found, duration 0')
      return 0
    }
    const duration = minorEventFinal.roundedDuration
    return duration !== undefined && duration !== null ? duration : 0
  })

  /**
   * LEARNING: Calculate time blocks for Time On-Site Graph
   * WHY: Shows major and minor time ranges when time slot is selected
   * PATTERN: Calculate from selected time slot and durations
   * NOTE: Inspector and the client column label are UI labels for differential scheduling roles (see APPOINTMENTS_TABLE_UI.CLIENT_LABEL)
   */
  const differentialTimeBlocks = computed(() => {
    if (!majorTimeSlot.value) {
      // PATTERN: Return rounded durations when no time selected (rounding computed at event level)
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
    
    // PATTERN: Calculate start and end times from selected slot and durations
    const majorStart = new Date(majorTimeSlot.value.startTime)
    const majorEnd = new Date(majorStart.getTime() + majorDuration.value * 60 * 1000)
    
    // LEARNING: Format time block range
    // WHY: Displays time range in readable format
    // PATTERN: Format start and end times, combine with arrow
    const formatTimeBlock = (start: Date, end: Date): string => {
      // LEARNING: Use composable for UI-boundary formatting
      // WHY: All local time conversions must go through useLocalTime composable
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

    // PATTERN: Use minor time slot if available, otherwise use major end time as minor start
    let minorTimeBlock: string | null = null
    if (isDifferentialService.value && minorTimeSlot.value) {
      const minorStart = new Date(minorTimeSlot.value.startTime)
      const minorEnd = new Date(minorStart.getTime() + minorDuration.value * 60 * 1000)
      minorTimeBlock = formatTimeBlock(minorStart, minorEnd)
    } else if (isDifferentialService.value) {
      // LEARNING: Use major end time as minor start time
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

