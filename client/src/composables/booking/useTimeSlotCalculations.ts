/**
 * WHY: useTimeSlotCalculations Composable

WHY: Moves duration calculations and...
 */
import { computed } from 'vue'
import { createLogger } from '@/utils/logger'
import { formatDuration } from '@/utils/time/timeFormatting'
import { localTime } from '@/utils/time/localTime'
import { toRFC3339DateTime } from '@/utils/datetime'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type {
  UseTimeSlotCalculationsParams,
  UseTimeSlotCalculationsReturn,
} from '@/types/booking/timeSlotCalculations'

export type {
  DifferentialTimeBlocks,
  UseTimeSlotCalculationsParams,
  UseTimeSlotCalculationsReturn,
} from '@/types/booking/timeSlotCalculations'

const logger = createLogger('useTimeSlotCalculations')

export function useTimeSlotCalculations(params: UseTimeSlotCalculationsParams): UseTimeSlotCalculationsReturn {
  const {
    appointmentShape,
    majorTimeSlot,
    minorTimeSlot,
    isDifferentialService
  } = params

  const { formatTimeRangeForDisplay } = localTime()
  
  const { settings: availabilitySettings } = useAvailabilitySettings()
  
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

  const majorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return 0
    
    const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const majorShape = getEventShapeByRole(eventShapeEntities, 'major')
    if (!majorShape) {
      logger.error('majorDuration: no event shape with differentialRole=major', {
        availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
      })
      return 0
    }
    const majorEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === majorShape.id)
    return majorEventFinal?.roundedDuration ?? 0
  })

  const minorDuration = computed(() => {
    const shape = appointmentShape.value
    if (!shape || shape.slotShape.eventFinals.length === 0) return 0
    
    const eventShapeEntities = shape.slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const minorShape = getEventShapeByRole(eventShapeEntities, 'minor')
    if (!minorShape) {
      logger.error('minorDuration: no event shape with differentialRole=minor', {
        availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
      })
      return 0
    }
    const minorEventFinal = shape.slotShape.eventFinals.find(ef => ef.eventShape.id === minorShape.id)
    return minorEventFinal?.roundedDuration ?? 0
  })

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

