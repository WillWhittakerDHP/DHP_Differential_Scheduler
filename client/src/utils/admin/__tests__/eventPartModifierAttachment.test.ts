import { describe, expect, it } from 'vitest'
import {
  allActivePartShapeOptions,
  assignedPartShapeIdsForBlock,
  firstAssignedPartInstanceForBlock,
} from '@/utils/admin/eventPartModifierAttachment'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function partShape(id: string, name: string, active = true): GlobalEntity<'partShape'> {
  return { id, entityKey: 'partShape', name, orderIndex: 0, active } as GlobalEntity<'partShape'>
}

function part(id: string, partShapeRef: string): GlobalEntity<'partInstance'> {
  return {
    id,
    entityKey: 'partInstance',
    name: id,
    orderIndex: 0,
    partShapeRef,
    active: true,
  } as GlobalEntity<'partInstance'>
}

function block(id: string): GlobalEntity<'blockInstance'> {
  return { id, entityKey: 'blockInstance', name: id } as GlobalEntity<'blockInstance'>
}

describe('eventPartModifierAttachment', () => {
  it('lists all active part shapes for the simple picker', () => {
    const options = allActivePartShapeOptions([
      partShape('ps-b', 'Report'),
      partShape('ps-a', 'Data'),
      partShape('ps-x', 'Hidden', false),
    ])
    expect(options.map((o) => o.id)).toEqual(['ps-a', 'ps-b'])
  })

  it('reads the first assigned modifier part for an event block', () => {
    const eventBlock = block('event-1')
    const dataPart = part('part-1', 'ps-data')
    const found = firstAssignedPartInstanceForBlock({
      blockInstanceId: 'event-1',
      partAssignments: [
        {
          relationshipKind: 'partAssignments',
          parent: eventBlock,
          children: [dataPart],
        } as GlobalRelationship,
      ],
      partInstances: [dataPart],
    })
    expect(found?.id).toBe('part-1')
    expect(
      [...assignedPartShapeIdsForBlock({
        blockInstanceId: 'event-1',
        partAssignments: [
          {
            relationshipKind: 'partAssignments',
            parent: eventBlock,
            children: [dataPart],
          } as GlobalRelationship,
        ],
        partInstances: [dataPart],
      })]
    ).toEqual(['ps-data'])
  })
})
