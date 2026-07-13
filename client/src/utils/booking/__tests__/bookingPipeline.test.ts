/**
 * Pipeline-level tests for the booking finalization contract (BONSAI_SPEC §6 items 3–5).
 *
 * Locks in two invariants from docs/ARCHITECTURE_PRINCIPLES.md:
 * - §4.4 step 5 / §4.8: zero-out is applied LAST, PER PART — a zeroed part inside a
 *   mixed block contributes nothing to durations, event totals, or fee rollups.
 * - §4.2 / §5.2: event assignment resolves per part instance as
 *   `event profile override ?? event orchestrator baseline` — override REPLACES baseline.
 */
import { describe, expect, it } from 'vitest'
import { buildAppointmentShape } from '@/utils/booking/appointmentSlotBuilder'
import { createBlockFinal } from '@/utils/booking/BlockFinal'
import type {
  BookingBlockInstance,
  BookingPartInstance,
} from '@/utils/transformers/globalToBookingTransformer'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'

function makePart(overrides: Partial<BookingPartInstance> & { id: string }): BookingPartInstance {
  return {
    entityKey: 'partInstance',
    name: overrides.id,
    active: true,
    partShape: 'Work Item',
    baseTime: 0,
    timePerUnit: 0,
    baseFee: 0,
    feePerUnit: 0,
    orderIndex: 0,
    zeroOutPart: false,
    activePartIds: [],
    ...overrides,
  } as BookingPartInstance
}

function makeBlock(
  overrides: Partial<BookingBlockInstance> & { id: string; partInstances: BookingPartInstance[] }
): BookingBlockInstance {
  return {
    entityKey: 'blockInstance',
    name: overrides.id,
    active: true,
    icon: '',
    orchestrator: false,
    wizardPlacement: 'topLine',
    preClosing: false,
    orderIndex: 0,
    blockShape: 'service',
    blockShapeRef: 'shape-service',
    activeBlockIds: [],
    allowMultiple: false,
    requiresUnitNumber: null,
    isMultiFamily: false,
    requiresAgent: false,
    ...overrides,
  } as BookingBlockInstance
}

function makeEventShape(id: string, placementKind: string): EventShape {
  return {
    id,
    entityKey: 'eventShape',
    name: id,
    active: true,
    placementKind,
    anchorEdge: null,
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

function makeAssignment(
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

describe('zero-out ordering (§4.4 step 5, §4.8: last, per part)', () => {
  it('excludes a zeroed part inside a mixed block from total duration', () => {
    const block = makeBlock({
      id: 'block-1',
      partInstances: [
        makePart({ id: 'part-live', baseTime: 60 }),
        makePart({ id: 'part-zeroed', baseTime: 45, zeroOutPart: true }),
      ],
    })

    const shape = buildAppointmentShape([block])

    expect(shape.slotShape.rawDuration).toBe(60)
    expect(shape.finalizedParts).toHaveLength(1)
    expect(shape.finalizedParts[0]?.sourcePartInstances[0]?.id).toBe('part-live')
  })

  it('excludes a zeroed part from event-segment durations', () => {
    const primaryShape = makeEventShape('es-primary', 'primary')
    const primaryInstance = makeEventInstance('ei-primary', 'es-primary')
    const block = makeBlock({
      id: 'block-1',
      partInstances: [
        makePart({ id: 'part-live', baseTime: 30 }),
        makePart({ id: 'part-zeroed', baseTime: 90, zeroOutPart: true }),
      ],
    })
    const assignments = [makeAssignment('blockInstance', 'block-1', ['ei-primary'])]

    const shape = buildAppointmentShape(
      [block],
      null,
      [primaryInstance],
      [primaryShape],
      assignments
    )

    const primaryFinal = shape.slotShape.eventFinals.find(
      (ef) => ef.eventShape.id === 'es-primary'
    )
    expect(primaryFinal?.rawDuration).toBe(30)
  })

  it('still drops a block when every part is zeroed', () => {
    const block = makeBlock({
      id: 'block-all-zeroed',
      partInstances: [
        makePart({ id: 'p1', baseTime: 30, zeroOutPart: true }),
        makePart({ id: 'p2', baseTime: 15, zeroOutPart: true }),
      ],
    })

    const shape = buildAppointmentShape([block])

    expect(shape.finalizedBlocks).toHaveLength(0)
    expect(shape.slotShape.rawDuration).toBe(0)
  })

  it('excludes zeroed parts from blockTotals fee/time rollups (zero-out wins over prior math)', () => {
    const blockFinal = createBlockFinal(
      makeBlock({
        id: 'block-1',
        partInstances: [
          makePart({ id: 'part-live', baseTime: 60, baseFee: 100, feePerUnit: 2, timePerUnit: 1 }),
          makePart({
            id: 'part-zeroed',
            baseTime: 45,
            baseFee: 500,
            feePerUnit: 9,
            timePerUnit: 7,
            zeroOutPart: true,
          }),
        ],
      })
    )

    expect(blockFinal.blockTotals).toEqual({
      baseTime: 60,
      baseFee: 100,
      timePerUnit: 1,
      feePerUnit: 2,
    })
    // Provenance preserved: zeroed part still present in finalizedParts for admin/dev surfaces.
    expect(blockFinal.finalizedParts).toHaveLength(2)
  })
})

describe('event assignment resolution (§4.2/§5.2: override ?? baseline)', () => {
  const primaryShape = makeEventShape('es-primary', 'primary')
  const floatingShape = makeEventShape('es-floating', 'floating')
  const primaryInstance = makeEventInstance('ei-primary', 'es-primary')
  const floatingInstance = makeEventInstance('ei-floating', 'es-floating')
  const eventInstances = [primaryInstance, floatingInstance]
  const eventShapes = [primaryShape, floatingShape]

  it('falls back to the block baseline when a part has no override', () => {
    const block = makeBlock({
      id: 'block-1',
      partInstances: [makePart({ id: 'part-a', baseTime: 30 })],
    })
    const assignments = [makeAssignment('blockInstance', 'block-1', ['ei-primary'])]

    const shape = buildAppointmentShape([block], null, eventInstances, eventShapes, assignments)

    expect(shape.eventAssignmentsByPartInstanceId['part-a']?.map((ei) => ei.id)).toEqual([
      'ei-primary',
    ])
  })

  it('part-level override REPLACES the block baseline (not unioned)', () => {
    const block = makeBlock({
      id: 'block-1',
      partInstances: [
        makePart({ id: 'part-overridden', baseTime: 30 }),
        makePart({ id: 'part-default', baseTime: 60 }),
      ],
    })
    const assignments = [
      makeAssignment('blockInstance', 'block-1', ['ei-primary']),
      makeAssignment('partInstance', 'part-overridden', ['ei-floating']),
    ]

    const shape = buildAppointmentShape([block], null, eventInstances, eventShapes, assignments)

    // Overridden part routes ONLY to the floating segment.
    expect(shape.eventAssignmentsByPartInstanceId['part-overridden']?.map((ei) => ei.id)).toEqual([
      'ei-floating',
    ])
    // Untouched part keeps the baseline.
    expect(shape.eventAssignmentsByPartInstanceId['part-default']?.map((ei) => ei.id)).toEqual([
      'ei-primary',
    ])

    const floatingFinal = shape.slotShape.eventFinals.find(
      (ef) => ef.eventShape.id === 'es-floating'
    )
    const primaryFinal = shape.slotShape.eventFinals.find(
      (ef) => ef.eventShape.id === 'es-primary'
    )
    expect(floatingFinal?.rawDuration).toBe(30)
    expect(primaryFinal?.rawDuration).toBe(60)
  })
})
