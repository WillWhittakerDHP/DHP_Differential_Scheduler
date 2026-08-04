import { describe, expect, it, vi } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import {
  buildEventWorkItemRoutingRows,
  packageSegmentIdsForEventBlock,
  syncPartEventSegmentOverride,
} from '@/utils/admin/eventWorkItemRouting'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function shape(id: string, semanticType: string): GlobalEntity<'blockShape'> {
  return {
    id,
    entityKey: 'blockShape',
    name: semanticType,
    orderIndex: 0,
    semanticType,
  } as GlobalEntity<'blockShape'>
}

function block(
  id: string,
  name: string,
  blockShapeRef: string
): GlobalEntity<'blockInstance'> {
  return {
    id,
    entityKey: 'blockInstance',
    name,
    orderIndex: 0,
    blockShapeRef,
    icon: '',
    isMultiFamily: false,
    requiresAgent: false,
    active: true,
    wizardPlacement: 'topLine',
  } as GlobalEntity<'blockInstance'>
}

function part(id: string, name: string, partShapeRef: string): GlobalEntity<'partInstance'> {
  return {
    id,
    entityKey: 'partInstance',
    name,
    orderIndex: 0,
    partShapeRef,
    baseTime: 0,
    timePerUnit: 0,
    baseMultiplier: 1,
    rateMultiplier: 1,
    baseFee: 0,
    feePerUnit: 0,
    active: true,
    zeroOutPart: false,
  } as GlobalEntity<'partInstance'>
}

function partShape(id: string, name: string): GlobalEntity<'partShape'> {
  return { id, entityKey: 'partShape', name, orderIndex: 0 } as GlobalEntity<'partShape'>
}

function event(
  id: string,
  name: string,
  parentBlockInstanceId: string
): GlobalEntity<'eventInstance'> {
  return {
    id,
    entityKey: 'eventInstance',
    name,
    orderIndex: 0,
    active: true,
    eventShapeRef: 'shape-primary',
    parentBlockInstanceId,
  } as GlobalEntity<'eventInstance'>
}

function partAssign(
  service: GlobalEntity<'blockInstance'>,
  parts: GlobalEntity<'partInstance'>[]
): GlobalRelationship {
  return { relationshipKind: 'partAssignments', parent: service, children: parts } as GlobalRelationship
}

function partToSegment(
  partEntity: GlobalEntity<'partInstance'>,
  segments: GlobalEntity<'eventInstance'>[]
): GlobalRelationship {
  return {
    relationshipKind: 'eventAssignments',
    parent: partEntity,
    children: segments,
  } as GlobalRelationship
}

describe('eventWorkItemRouting', () => {
  it('lists package segments owned by the event block', () => {
    const primary = event('ei-primary', 'Primary', 'event-mtos')
    const early = event('ei-early', 'Early Arrival', 'event-mtos')
    const other = event('ei-other', 'Other', 'event-other')
    expect(packageSegmentIdsForEventBlock('event-mtos', [primary, early, other])).toEqual([
      'ei-primary',
      'ei-early',
    ])
  })

  it('builds work-item rows with overrides into this package only', () => {
    const serviceShape = shape('shape-service', BLOCK_SHAPE_TYPES.SERVICE)
    const timeShape = shape('shape-time', BLOCK_SHAPE_TYPES.TIME)
    const service = block('svc-1', 'Roof Observations', 'shape-service')
    const time = block('time-1', 'Square Footage', 'shape-time')
    const dataShape = partShape('ps-data', 'Data Collection')
    const exterior = part('part-exterior', 'Exterior', 'ps-data')
    const timePart = part('part-time', 'SqFt time', 'ps-data')
    const primary = event('ei-primary', 'Primary', 'event-mtos')
    const early = event('ei-early', 'Early Arrival', 'event-mtos')

    const rows = buildEventWorkItemRoutingRows({
      eventBlockInstanceId: 'event-mtos',
      blockInstances: [service, time],
      blockShapes: [serviceShape, timeShape],
      partInstances: [exterior, timePart],
      partShapes: [dataShape],
      partAssignments: [
        partAssign(service, [exterior]),
        partAssign(time, [timePart]),
      ],
      eventInstances: [primary, early],
      eventAssignments: [partToSegment(exterior, [early])],
    })

    expect(rows).toHaveLength(2)
    expect(rows.find((row) => row.partInstanceId === 'part-exterior')).toMatchObject({
      workItemName: 'Exterior',
      sourceBlockName: 'Roof Observations',
      assignedSegmentId: 'ei-early',
    })
    expect(rows.find((row) => row.partInstanceId === 'part-time')).toMatchObject({
      workItemName: 'SqFt time',
      sourceBlockName: 'Square Footage',
      assignedSegmentId: null,
    })
  })

  it('includes time-block parts when filtered by part shape', () => {
    const serviceShape = shape('shape-service', BLOCK_SHAPE_TYPES.SERVICE)
    const timeShape = shape('shape-time', BLOCK_SHAPE_TYPES.TIME)
    const service = block('svc-1', 'Buyer Inspection', 'shape-service')
    const time = block('time-1', 'Square Footage', 'shape-time')
    const dataShape = partShape('ps-data', 'Data Collection')
    const reportShape = partShape('ps-report', 'Report Writing')
    const exterior = part('part-exterior', 'Exterior', 'ps-data')
    const report = part('part-report', 'Report', 'ps-report')
    const timeExterior = part('part-time-ext', 'Exterior time', 'ps-data')
    const early = event('ei-early', 'Early Arrival', 'event-mtos')

    const rows = buildEventWorkItemRoutingRows({
      eventBlockInstanceId: 'event-mtos',
      blockInstances: [service, time],
      blockShapes: [serviceShape, timeShape],
      partInstances: [exterior, report, timeExterior],
      partShapes: [dataShape, reportShape],
      partAssignments: [
        partAssign(service, [exterior, report]),
        partAssign(time, [timeExterior]),
      ],
      eventInstances: [early],
      eventAssignments: [],
      limitToPartShapeIds: new Set(['ps-data']),
    })

    expect(rows.map((row) => row.partInstanceId).sort()).toEqual([
      'part-exterior',
      'part-time-ext',
    ])
  })

  it('syncs part → segment override create and remove within the package', async () => {
    const createEventAssignment = vi.fn().mockResolvedValue({ id: 'created' })
    const removeEventAssignment = vi.fn().mockResolvedValue(undefined)

    await syncPartEventSegmentOverride({
      partInstanceId: 'part-exterior',
      packageSegmentIds: ['ei-primary', 'ei-early'],
      desiredSegmentId: 'ei-early',
      currentlyAssignedSegmentIds: ['ei-primary'],
      createEventAssignment,
      removeEventAssignment,
    })

    expect(createEventAssignment).toHaveBeenCalledWith({
      parentId: 'part-exterior',
      childId: 'ei-early',
    })
    expect(removeEventAssignment).toHaveBeenCalledWith('part-exterior', 'ei-primary')
  })

  it('filters routing rows to a single attached part shape', () => {
    const serviceShape = shape('shape-service', BLOCK_SHAPE_TYPES.SERVICE)
    const service = block('svc-1', 'Roof Observations', 'shape-service')
    const dataShape = partShape('ps-data', 'Data Collection')
    const reportShape = partShape('ps-report', 'Report Writing')
    const exterior = part('part-exterior', 'Exterior', 'ps-data')
    const report = part('part-report', 'Report', 'ps-report')
    const primary = event('ei-primary', 'Primary', 'event-atomic')

    const rows = buildEventWorkItemRoutingRows({
      eventBlockInstanceId: 'event-atomic',
      blockInstances: [service],
      blockShapes: [serviceShape],
      partInstances: [exterior, report],
      partShapes: [dataShape, reportShape],
      partAssignments: [partAssign(service, [exterior, report])],
      eventInstances: [primary],
      eventAssignments: [],
      limitToPartShapeIds: new Set(['ps-data']),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.partInstanceId).toBe('part-exterior')
  })
})
