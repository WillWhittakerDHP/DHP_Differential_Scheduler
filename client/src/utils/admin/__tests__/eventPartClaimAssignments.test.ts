import { describe, expect, it, vi } from 'vitest'
import {
  buildEventTimeClaimServiceOptions,
  syncEventInstanceTimeBlockClaimAssignments,
  timeBlockIdsForEventInstance,
} from '@/utils/admin/eventPartClaimAssignments'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function blockShape(id: string, name: string, semanticType: string): GlobalEntity<'blockShape'> {
  return { id, entityKey: 'blockShape', name, orderIndex: 0, semanticType } as GlobalEntity<'blockShape'>
}

function block(id: string, name: string, blockShapeRef: string): GlobalEntity<'blockInstance'> {
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

function partShape(id: string, name: string): GlobalEntity<'partShape'> {
  return { id, entityKey: 'partShape', name, orderIndex: 0 } as GlobalEntity<'partShape'>
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

function relationship(
  kind: 'partAssignments' | 'bookingCascades' | 'instanceComponents',
  parent: GlobalEntity<'blockInstance'>,
  children: GlobalEntity<'blockInstance' | 'partInstance'>[]
): GlobalRelationship {
  return { relationshipKind: kind, parent, children } as GlobalRelationship
}

describe('eventPartClaimAssignments', () => {
  it('builds service grouped time-claim options with time block parts', () => {
    const serviceShape = blockShape('shape-service', 'Service', 'service')
    const timeShape = blockShape('shape-time', 'Time', 'time')
    const dataShape = partShape('part-shape-data', 'Data Collection')
    const service = block('block-service', 'Buyer Inspection', 'shape-service')
    const exterior = block('block-exterior', 'Exterior Observations', 'shape-time')
    const directPart = part('part-service-data', 'Service Data', 'part-shape-data')
    const exteriorPart = part('part-exterior-data', 'Exterior Data', 'part-shape-data')

    const options = buildEventTimeClaimServiceOptions({
      blockInstances: [service, exterior],
      blockShapes: [serviceShape, timeShape],
      partInstances: [directPart, exteriorPart],
      partShapes: [dataShape],
      partAssignments: [
        relationship('partAssignments', service, [directPart]),
        relationship('partAssignments', exterior, [exteriorPart]),
      ],
      bookingCascades: [relationship('bookingCascades', service, [exterior])],
      instanceComponents: [],
    })

    const serviceOption = options.find((option) => option.id === 'block-service')
    expect(serviceOption?.timeBlocks.map((time) => time.id)).toEqual(['block-exterior'])
    expect(serviceOption?.timeBlocks[0]?.parts.map((part) => part.id)).toEqual(['part-exterior-data'])
  })

  it('reads time-block-scoped event assignments for one event instance', () => {
    const ids = timeBlockIdsForEventInstance('event-1', [
      {
        id: 'rel-1',
        kind: 'eventAssignments',
        parentKind: 'blockInstance',
        childKind: 'eventInstance',
        parentId: 'time-a',
        childId: 'event-1',
        disabled: false,
      },
      {
        id: 'rel-2',
        kind: 'eventAssignments',
        parentKind: 'blockInstance',
        childKind: 'eventInstance',
        parentId: 'service-a',
        childId: 'event-1',
        disabled: false,
      },
    ], ['time-a'])

    expect(ids).toEqual(['time-a'])
  })

  it('syncs claimed time block ids through event assignments', async () => {
    const createEventAssignment = vi.fn().mockResolvedValue({ id: 'created' })
    const removeEventAssignment = vi.fn().mockResolvedValue(undefined)

    await syncEventInstanceTimeBlockClaimAssignments({
      eventInstanceId: 'event-1',
      oldTimeBlockIds: ['time-a', 'time-b'],
      newTimeBlockIds: ['time-b', 'time-c'],
      createEventAssignment,
      removeEventAssignment,
    })

    expect(createEventAssignment).toHaveBeenCalledWith({
      parentId: 'time-c',
      childId: 'event-1',
    })
    expect(removeEventAssignment).toHaveBeenCalledWith('time-a', 'event-1')
  })
})
