
import type { AppointmentSlot, AppointmentSlots } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { buildAppointmentShape, applyShapeToTime } from './appointmentSlotBuilder'

export function calculateAppointmentSlots(
  blockInstances: BookingBlockInstance[],
  baseStartTime?: string | null,
  eventInstances?: EventInstance[],
  eventShapes?: EventShape[],
  eventAssignmentsRelationships?: GlobalRelationship[],
  partShapeById?: Map<string, GlobalEntity<'partShape'>>,
  settings?: AvailabilitySettings | null
): AppointmentSlots {
  if (!blockInstances || blockInstances.length === 0) {
    return []
  }
  
  // PATTERN: Use buildAppointmentShape to create shape, pass events data and settings if available
  const shape = buildAppointmentShape(
    blockInstances, 
    settings || null,
    eventInstances,
    eventShapes,
    eventAssignmentsRelationships,
    partShapeById
    // PATTERN: Only pass required parameters, omit optional ones that aren't needed
  )
  
  // PATTERN: Use applyShapeToTime to create slot
  if (baseStartTime) {
    const appointmentSlot = applyShapeToTime(shape, baseStartTime, 0, undefined, true)
    return [appointmentSlot]
  }
  
  // PATTERN: Create minimal slot with shape reference
  const appointmentSlot: AppointmentSlot = {
    buttonIndex: 0,
    isAvailable: true,
    orderIndex: 0,
    shape,
    startTime: '',
    totalTimeRange: null,
    eventTimeRanges: {}
  }
  
  return [appointmentSlot]
}

export function normalizeAppointmentSlotsByOrderIndex(appointmentSlots: AppointmentSlots): AppointmentSlots {
  if (!appointmentSlots || appointmentSlots.length === 0) {
    return []
  }
  
  // PATTERN: Sort ascending by orderIndex
  // FIX: Handle orderIndex from index signature - check type before arithmetic
  const sorted = [...appointmentSlots].sort((a, b) => {
    const aIndex = typeof a.orderIndex === 'number' ? a.orderIndex : 0
    const bIndex = typeof b.orderIndex === 'number' ? b.orderIndex : 0
    return aIndex - bIndex
  })
  
  // PATTERN: Map over sorted array, assign index as orderIndex
  return sorted.map((appointmentSlot, index) => ({
    ...appointmentSlot,
    orderIndex: index
  }))
}

export function calculateTotalDurationFromAppointmentSlots(appointmentSlots: AppointmentSlots): number {
  return appointmentSlots.reduce((sum, appointmentSlot) => {
    return sum + (appointmentSlot.totalTimeRange?.duration || appointmentSlot.shape.slotShape.roundedDuration || 0)
  }, 0)
}

