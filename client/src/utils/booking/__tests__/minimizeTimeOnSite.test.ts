/**
 * Flagship acceptance test: "Minimize Time On Site" (BONSAI_SPEC §6.1 item 5).
 *
 * Pipeline-level integration: given a catalog (service block with parts), an event
 * profile (segments per principles §5.2), and selections, the booking pipeline must
 * produce the expected segment layout — and changing the profile's assignments must
 * change the layout with no code changes.
 *
 * Profile modeled after principles §5.2:
 *   EarlyArrival        → placement_kind = marginal  (exterior work before on-site window)
 *   Primary             → placement_kind = primary   (shrunken on-site window)
 *   FormalPresentation  → placement_kind = secondary (client presentation, anchored after)
 *   OffSite             → placement_kind = floating  (report writing, scheduled wherever it fits)
 */
import { describe, expect, it } from 'vitest'
import { buildAppointmentShape } from '@/utils/booking/appointmentSlotBuilder'
import {
  listMinimizerSegmentsFromAppointmentShape,
  sumMinimizerSegmentsRoundedDurationMinutes,
} from '@/utils/booking/minimizerEventShapes'
import type {
  BookingBlockInstance,
  BookingPartInstance,
} from '@/utils/transformers/globalToBookingTransformer'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'

function makePart(id: string, baseTime: number): BookingPartInstance {
  return {
    id,
    entityKey: 'partInstance',
    name: id,
    active: true,
    partShape: id,
    baseTime,
    timePerUnit: 0,
    baseFee: 0,
    feePerUnit: 0,
    orderIndex: 0,
    zeroOutPart: false,
    activePartIds: [],
  } as BookingPartInstance
}

function makeServiceBlock(id: string, partInstances: BookingPartInstance[]): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: id,
    active: true,
    baseSqFt: 0,
    icon: '',
    agentPermissions: 'false',
    orchestrator: true,
    wizardVisible: true,
    preClosing: false,
    orderIndex: 0,
    blockShape: 'service',
    blockShapeRef: 'shape-service',
    activeBlockIds: [],
    partInstances,
    allowMultiple: false,
    requiresUnitNumber: null,
    isMultiFamily: false,
    requiresAgent: false,
  } as BookingBlockInstance
}

function makeEventShape(
  id: string,
  placementKind: 'primary' | 'secondary' | 'marginal' | 'floating',
  anchorEdge: 'start' | 'end' | null = null
): EventShape {
  return {
    id,
    entityKey: 'eventShape',
    name: id,
    active: true,
    placementKind,
    anchorEdge,
  } as unknown as EventShape
}

function makeEventInstance(id: string, eventShapeRef: string): EventInstance {
  return {
    id,
    entityKey: 'eventInstance',
    name: id,
    active: true,
    eventShapeRef,
  } as unknown as EventInstance
}

function assignment(
  parentEntityKey: 'blockInstance' | 'partInstance',
  parentId: string,
  eventInstanceIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'eventAssignments',
    parent: { entityKey: parentEntityKey, id: parentId } as GlobalRelationship['parent'],
    children: eventInstanceIds.map(
      (id) => ({ entityKey: 'eventInstance', id }) as GlobalRelationship['children'][number]
    ),
  }
}

// --- Catalog fixture: "Buyer's Inspection" with four work items ---
const EXTERIOR_MIN = 60
const INTERIOR_MIN = 120
const REPORT_MIN = 45
const PRESENTATION_MIN = 30

function makeCatalog() {
  const parts = [
    makePart('part-exterior', EXTERIOR_MIN),
    makePart('part-interior', INTERIOR_MIN),
    makePart('part-report-writing', REPORT_MIN),
    makePart('part-presentation', PRESENTATION_MIN),
  ]
  const service = makeServiceBlock('block-buyers-inspection', parts)

  const shapes = {
    primary: makeEventShape('es-primary', 'primary'),
    secondary: makeEventShape('es-secondary', 'secondary', 'end'),
    marginal: makeEventShape('es-marginal', 'marginal', 'start'),
    floating: makeEventShape('es-floating', 'floating'),
  }
  const segments = {
    primary: makeEventInstance('ei-primary', 'es-primary'),
    earlyArrival: makeEventInstance('ei-early-arrival', 'es-marginal'),
    formalPresentation: makeEventInstance('ei-formal-presentation', 'es-secondary'),
    offSite: makeEventInstance('ei-off-site', 'es-floating'),
  }

  return {
    service,
    eventShapes: Object.values(shapes),
    eventInstances: Object.values(segments),
    /** Baseline (event orchestrator): everything in Primary. */
    baseline: assignment('blockInstance', 'block-buyers-inspection', ['ei-primary']),
  }
}

/** Profile overrides per §5.2 — admin-configured event_assignments rows, pure data. */
function minimizeTimeOnSiteProfile(): GlobalRelationship[] {
  return [
    assignment('partInstance', 'part-exterior', ['ei-early-arrival']),
    assignment('partInstance', 'part-report-writing', ['ei-off-site']),
    assignment('partInstance', 'part-presentation', ['ei-formal-presentation']),
    // part-interior has no override → falls back to Primary baseline.
  ]
}

function segmentDuration(shape: ReturnType<typeof buildAppointmentShape>, eventShapeId: string) {
  return shape.slotShape.eventFinals.find((ef) => ef.eventShape.id === eventShapeId)?.rawDuration
}

describe('Minimize Time On Site — §6.1 segment layout', () => {
  it('standard booking: every part lands in the Primary segment', () => {
    const { service, eventShapes, eventInstances, baseline } = makeCatalog()

    const shape = buildAppointmentShape([service], null, eventInstances, eventShapes, [baseline])

    expect(segmentDuration(shape, 'es-primary')).toBe(
      EXTERIOR_MIN + INTERIOR_MIN + REPORT_MIN + PRESENTATION_MIN
    )
    expect(segmentDuration(shape, 'es-marginal')).toBeUndefined()
    expect(segmentDuration(shape, 'es-floating')).toBeUndefined()
    expect(listMinimizerSegmentsFromAppointmentShape(shape)).toHaveLength(0)
  })

  it('minimized booking: exterior → early arrival, report → off-site, presentation → anchored after, primary shrinks', () => {
    const { service, eventShapes, eventInstances, baseline } = makeCatalog()
    const relationships = [baseline, ...minimizeTimeOnSiteProfile()]

    const shape = buildAppointmentShape(
      [service],
      null,
      eventInstances,
      eventShapes,
      relationships
    )

    // Early-arrival segment contains exactly the exterior work.
    expect(segmentDuration(shape, 'es-marginal')).toBe(EXTERIOR_MIN)
    // Primary on-site window shrinks to interior only.
    expect(segmentDuration(shape, 'es-primary')).toBe(INTERIOR_MIN)
    // Presentation anchored after the primary window.
    expect(segmentDuration(shape, 'es-secondary')).toBe(PRESENTATION_MIN)
    // Report writing floats off-site.
    expect(segmentDuration(shape, 'es-floating')).toBe(REPORT_MIN)

    // Minimizer flow detects the floating segment (drives the completion-window modal).
    const minimizerSegments = listMinimizerSegmentsFromAppointmentShape(shape)
    expect(minimizerSegments).toHaveLength(1)
    expect(minimizerSegments[0]?.eventShapeId).toBe('es-floating')
    expect(sumMinimizerSegmentsRoundedDurationMinutes(shape)).toBe(REPORT_MIN)
  })

  it('reconfiguring the profile in admin (data only) changes the next booking layout', () => {
    const { service, eventShapes, eventInstances, baseline } = makeCatalog()

    // Admin moves interior observations into the early-arrival segment too —
    // a new event_assignments row, no code changes.
    const reconfigured = [
      baseline,
      ...minimizeTimeOnSiteProfile(),
      assignment('partInstance', 'part-interior', ['ei-early-arrival']),
    ]

    const shape = buildAppointmentShape([service], null, eventInstances, eventShapes, reconfigured)

    expect(segmentDuration(shape, 'es-marginal')).toBe(EXTERIOR_MIN + INTERIOR_MIN)
    // Nothing remains in the primary window.
    expect(segmentDuration(shape, 'es-primary')).toBeUndefined()
  })

  it('client-facing totals derive from segment layout, not raw part list', () => {
    const { service, eventShapes, eventInstances, baseline } = makeCatalog()
    const relationships = [baseline, ...minimizeTimeOnSiteProfile()]

    const shape = buildAppointmentShape(
      [service],
      null,
      eventInstances,
      eventShapes,
      relationships
    )

    // Total raw duration still accounts for all work (Will's full workload)…
    expect(shape.slotShape.rawDuration).toBe(
      EXTERIOR_MIN + INTERIOR_MIN + REPORT_MIN + PRESENTATION_MIN
    )
    // …while per-segment finals partition it for display/calendar placement.
    const segmentTotal = shape.slotShape.eventFinals.reduce((acc, ef) => acc + ef.rawDuration, 0)
    expect(segmentTotal).toBe(shape.slotShape.rawDuration)
  })
})
