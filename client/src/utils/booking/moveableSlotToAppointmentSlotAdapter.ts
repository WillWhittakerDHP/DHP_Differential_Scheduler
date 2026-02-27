/**
 * Adapter: MoveableSlot[] → AppointmentSlot[] for use in AppointmentSlotGrid.
 *
 * WHY: MoveablePartsModal needs to show moveable completion times in the same grid UX as
 * appointment slots. MoveableSlot has dayLabel/timeLabel and SlotTimeBounds; AppointmentSlotGrid
 * expects AppointmentSlots with shape/totalTimeRange for derivePerspective (nonDifferential).
 *
 * PATTERN: Display-only slots. Output is valid only for time-basis="nonDifferential".
 * Do not use with major/minor perspective; shape has empty eventFinals so
 * derivePerspective returns totalTimeRange.
 */
import type { AppointmentSlot, AppointmentShape, SlotShape, TimeRange } from '@/types/appointment'
import type { MoveableSlot } from '@/types/moveableScheduling'

/**
 * Maps moveable completion slots to the AppointmentSlot shape expected by AppointmentSlotGrid.
 * Each slot gets buttonIndex = array index, totalTimeRange from the moveable slot's bounds,
 * and isAvailable/flexibleViolations from the moveable slot when set (from server/computed slots).
 */
export function moveableSlotsToAppointmentSlots(moveableSlots: MoveableSlot[]): AppointmentSlot[] {
  return moveableSlots.map((slot, index) => moveableSlotToAppointmentSlot(slot, index))
}

function moveableSlotToAppointmentSlot(moveableSlot: MoveableSlot, buttonIndex: number): AppointmentSlot {
  const totalTimeRange: TimeRange = {
    startTime: moveableSlot.startTime,
    endTime: moveableSlot.endTime,
    duration: moveableSlot.duration,
  }
  const slotShape: SlotShape = {
    rawDuration: moveableSlot.duration,
    roundedDuration: moveableSlot.duration,
    eventFinals: [],
    rawDifferentialOffset: 0,
    roundedDifferentialOffset: 0,
  }
  const shape = {
    finalizedBlocks: [],
    finalizedParts: [],
    slotShape,
    eventAssignmentsByPartShape: {},
  } as AppointmentShape
  return {
    buttonIndex,
    isAvailable: moveableSlot.isAvailable ?? true,
    flexibleViolations: moveableSlot.violations?.length ? moveableSlot.violations : undefined,
    shape,
    startTime: moveableSlot.startTime,
    totalTimeRange,
    eventTimeRanges: {},
  }
}
