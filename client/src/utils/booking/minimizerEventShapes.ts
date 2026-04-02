/**
 * Ordered minimizer (completion-window / **floating** placement) segments from an appointment shape.
 * WHY: Multi-minimizer templates need every matching final in `eventFinals` order, not only the first.
 * PATTERN: Pure utilities — no Vue refs; safe for composables and tests.
 */

import { sanitizeEventPlacementKindInput } from '@shared/utils/eventPlacementUtils'
import type { AppointmentShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'

/** One minimizer scheduling segment derived from `slotShape.eventFinals` (completion-window path, not margin). */
export interface MinimizerSegmentDescriptor {
  /** Index into `AppointmentShape.slotShape.eventFinals` — stable order for sequential boundary chaining. */
  orderIndex: number
  /** Event shape id string (stable id for segment descriptors). */
  eventShapeId: string
  /** Event shape entity from the corresponding `EventFinal` (same reference as wizard pipeline). */
  eventShape: EventShapeEntity
  /** Durations from `EventFinal` (same units as the rest of the booking pipeline — minutes in practice). */
  rawDuration: number
  roundedDuration: number
}

/**
 * Lists every `eventFinal` that represents a **minimizer (completion-window) segment**, in
 * **`slotShape.eventFinals` array order**.
 *
 * **Selection:** **`placement_kind === 'floating'`** only (FEATURE_20 — minimizer placement; booking path is
 * placement-only after override map removal from **`AppointmentShape`**).
 *
 * **Margin:** **`marginal`** placement → not floating; excluded from this list.
 */
export function listMinimizerSegmentsFromAppointmentShape(
  shape: AppointmentShape
): MinimizerSegmentDescriptor[] {
  const finals = shape.slotShape.eventFinals
  const out: MinimizerSegmentDescriptor[] = []

  for (let i = 0; i < finals.length; i++) {
    const ef = finals[i]
    const eventShape = ef.eventShape as EventShapeEntity
    const eventShapeId = String(eventShape.id)
    if (sanitizeEventPlacementKindInput(eventShape.placementKind) !== 'floating') {
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
