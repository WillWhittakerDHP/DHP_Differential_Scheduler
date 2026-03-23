/**
 * Pure: moveable part rounded duration from built appointment shape (same rules as useMoveablePartsScheduling).
 */
import type { AppointmentShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'

export function getMoveableRoundedDurationMinutesFromAppointmentShape(
  shape: AppointmentShape | null
): number {
  if (!shape || shape.slotShape.eventFinals.length === 0) return 0
  const eventShapes = shape.slotShape.eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
  const moveableShape = getEventShapeByRoleWithOverrides(
    eventShapes,
    'moveable',
    shape.differentialEventRoleOverrides ?? null
  )
  if (!moveableShape) return 0
  const ef = shape.slotShape.eventFinals.find((e) => e.eventShape.id === moveableShape.id)
  return ef?.roundedDuration ?? 0
}
