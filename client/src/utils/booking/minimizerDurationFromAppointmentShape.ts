/**
 * Pure: minimizer part rounded duration from built appointment shape (same rules as useMinimizerPartsScheduling).
 */
import type { AppointmentShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'

export function getMinimizerRoundedDurationMinutesFromAppointmentShape(
  shape: AppointmentShape | null
): number {
  if (!shape || shape.slotShape.eventFinals.length === 0) return 0
  const eventShapes = shape.slotShape.eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
  const minimizerShape = getEventShapeByRoleWithOverrides(
    eventShapes,
    'minimizer',
    shape.differentialEventRoleOverrides ?? null
  )
  if (!minimizerShape) return 0
  const ef = shape.slotShape.eventFinals.find((e) => e.eventShape.id === minimizerShape.id)
  return ef?.roundedDuration ?? 0
}
