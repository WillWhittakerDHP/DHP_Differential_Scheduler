import { describe, expect, it } from 'vitest'
import { availableComposablePeersForComposer } from '@/utils/componentEntity/blockCompositionDomain'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import type { InstanceComponent } from '@/types/component'

function stubGlobalData(params: {
  shapes: Array<Partial<BlockShapeEntity> & { id: string; semanticType: string }>
  instances: Array<
    Partial<BlockInstanceEntity> & {
      id: string
      name: string
      blockShapeRef: string
      composite: boolean
    }
  >
}): GlobalData {
  return {
    entities: {
      blockShape: params.shapes as BlockShapeEntity[],
      blockInstance: params.instances as BlockInstanceEntity[],
    },
    relationships: {},
  } as unknown as GlobalData
}

describe('availableComposablePeersForComposer', () => {
  const timeShapeId = 'shape-time'
  const serviceShapeId = 'shape-service'

  it('offers same-shape atomics to a composite composer, not peer packages', () => {
    const globalData = stubGlobalData({
      shapes: [
        { id: timeShapeId, name: 'Property Details', semanticType: 'time' },
        { id: serviceShapeId, name: 'Services', semanticType: 'service' },
      ],
      instances: [
        {
          id: 'sfh',
          name: 'Single Family Home',
          blockShapeRef: timeShapeId,
          composite: true,
          orchestrator: true,
        },
        {
          id: 'roof',
          name: 'Roof',
          blockShapeRef: timeShapeId,
          composite: false,
          orchestrator: false,
        },
        {
          id: 'exterior',
          name: 'Exterior',
          blockShapeRef: timeShapeId,
          composite: false,
          orchestrator: false,
        },
        {
          id: 'townhouse',
          name: 'Townhouse',
          blockShapeRef: timeShapeId,
          composite: true,
          orchestrator: true,
        },
        {
          id: 'equip-obs',
          name: 'Equipment Observations',
          blockShapeRef: serviceShapeId,
          composite: false,
          orchestrator: false,
        },
      ],
    })

    const peers = availableComposablePeersForComposer(globalData, 'sfh' as never, [])

    expect(peers.map((p) => p.name).sort()).toEqual(['Exterior', 'Roof'])
  })

  it('excludes already-linked children and returns nothing for non-composites', () => {
    const globalData = stubGlobalData({
      shapes: [{ id: timeShapeId, name: 'Property Details', semanticType: 'time' }],
      instances: [
        {
          id: 'sfh',
          name: 'Single Family Home',
          blockShapeRef: timeShapeId,
          composite: true,
        },
        {
          id: 'roof',
          name: 'Roof',
          blockShapeRef: timeShapeId,
          composite: false,
        },
        {
          id: 'exterior',
          name: 'Exterior',
          blockShapeRef: timeShapeId,
          composite: false,
        },
        {
          id: 'atomic-only',
          name: 'Appliances',
          blockShapeRef: timeShapeId,
          composite: false,
        },
      ],
    })

    const active = [
      {
        id: 'rel-1',
        parentId: 'sfh',
        childId: 'roof',
        disabled: false,
      },
    ] as InstanceComponent[]

    const peers = availableComposablePeersForComposer(globalData, 'sfh' as never, active)
    expect(peers.map((p) => p.name).sort()).toEqual(['Appliances', 'Exterior'])

    expect(
      availableComposablePeersForComposer(globalData, 'atomic-only' as never, [])
    ).toEqual([])
  })
})
