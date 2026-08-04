import { describe, expect, it } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { buildTimeBlockEventReadout } from '@/utils/admin/timeBlockEventReadout'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function shape(id: string, name: string, semanticType: string): GlobalEntity<'blockShape'> {
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
    wizardPlacement: 'topLine',
    active: true,
  } as GlobalEntity<'blockInstance'>
}

function event(id: string, name: string): GlobalEntity<'eventInstance'> {
  return { id, entityKey: 'eventInstance', name, orderIndex: 0, active: true, eventShapeRef: 'shape-event' } as GlobalEntity<'eventInstance'>
}

function rel(parent: GlobalEntity<'blockInstance'>, children: GlobalEntity<'eventInstance'>[]): GlobalRelationship {
  return { relationshipKind: 'eventAssignments', parent, children } as GlobalRelationship
}

describe('timeBlockEventReadout', () => {
  it('summarizes direct event claims for a time block', () => {
    const timeShape = shape('shape-time', 'Inspection Time', BLOCK_SHAPE_TYPES.TIME)
    const exterior = block('time-exterior', 'Exterior Observations', 'shape-time')
    const early = event('event-early', 'Early Arrival')

    const readout = buildTimeBlockEventReadout({
      blockInstanceId: 'time-exterior',
      blockInstances: [exterior],
      blockShapes: [timeShape],
      eventAssignments: [rel(exterior, [early])],
    })

    expect(readout).toEqual({
      applies: true,
      title: 'Inspection Time Events',
      timeBlockName: 'Exterior Observations',
      eventNames: ['Early Arrival'],
    })
  })
})
