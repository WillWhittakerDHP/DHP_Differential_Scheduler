/**
 * Ordered minimizer (storage role `minimizer`) segments from an appointment shape.
 * WHY: `getEventShapeByRoleWithOverrides` returns only the first match; multi-minimizer templates need every final in `eventFinals` order.
 * PATTERN: Pure utilities — no Vue refs; safe for composables and tests.
 */

import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
import { eventShapeDifferentialRoleFromPlacementFields } from '@shared/utils/eventPlacementUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'
import type { AppointmentShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'

/** One minimizer scheduling segment derived from `slotShape.eventFinals` (completion-window path, not margin). */
export interface MinimizerSegmentDescriptor {
  /** Index into `AppointmentShape.slotShape.eventFinals` — stable order for sequential boundary chaining. */
  orderIndex: number
  /** Event shape id string (matches `differentialEventRoleOverrides` keys). */
  eventShapeId: string
  /** Event shape entity from the corresponding `EventFinal` (same reference as wizard pipeline). */
  eventShape: EventShapeEntity
  /** Durations from `EventFinal` (same units as the rest of the booking pipeline — minutes in practice). */
  rawDuration: number
  roundedDuration: number
}

/**
 * Lists every `eventFinal` whose **effective** differential role is **`minimizer`** (storage role),
 * in **`slotShape.eventFinals` array order**.
 *
 * **Margin:** Effective role **`margin`** is excluded (pre-major path, not the minimizer completion segment).
 */
export function listMinimizerSegmentsFromAppointmentShape(
  shape: AppointmentShape
): MinimizerSegmentDescriptor[] {
  const overrides = shape.differentialEventRoleOverrides ?? null
  const finals = shape.slotShape.eventFinals
  const out: MinimizerSegmentDescriptor[] = []

  for (let i = 0; i < finals.length; i++) {
    const ef = finals[i]
    const eventShape = ef.eventShape as EventShapeEntity
    const eventShapeId = String(eventShape.id)
    const templateRole: DifferentialRole = eventShapeDifferentialRoleFromPlacementFields(
      eventShape.placementKind,
      eventShape.anchorEdge
    )
    const effective = effectiveDifferentialRole(eventShapeId, templateRole, overrides)
    if (effective !== 'minimizer') {
      continue
    }
    out.push({
      orderIndex: i,
      eventShapeId,
      eventShape,
      rawDuration: ef.rawDuration,
      roundedDuration: ef.roundedDuration,
    })
  }

  return out
}

/**
 * Total rounded minutes for all minimizer segments (completion-window path).
 * WHY: Fetch + window math must reserve time for every minimizer final, not only the first match.
 */
export function sumMinimizerSegmentsRoundedDurationMinutes(shape: AppointmentShape | null): number {
  if (!shape) {
    return 0
  }
  return listMinimizerSegmentsFromAppointmentShape(shape).reduce((acc, s) => acc + s.roundedDuration, 0)
}
