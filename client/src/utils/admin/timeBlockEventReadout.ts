import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

export interface TimeBlockEventReadout {
  applies: boolean
  title: string
  timeBlockName: string
  eventNames: string[]
}

function idOf(entity: { id: unknown }): string {
  return String(entity.id)
}

function blockShape(
  block: GlobalEntity<'blockInstance'>,
  shapesById: Map<string, GlobalEntity<'blockShape'>>
): GlobalEntity<'blockShape'> | undefined {
  return shapesById.get(String(block.blockShapeRef))
}

function activeEventNamesForBlock(blockId: string, eventAssignments: GlobalRelationship[]): string[] {
  return eventAssignments
    .filter((rel) => rel.parent.entityKey === 'blockInstance' && String(rel.parent.id) === blockId)
    .flatMap((rel) =>
      rel.children
        .filter((child) => child.entityKey === 'eventInstance' && child.active !== false)
        .map((child) => child.name)
    )
}

export function buildTimeBlockEventReadout(params: {
  blockInstanceId: string
  blockInstances: GlobalEntity<'blockInstance'>[]
  blockShapes: GlobalEntity<'blockShape'>[]
  eventAssignments: GlobalRelationship[]
}): TimeBlockEventReadout {
  const blockInstancesById = new Map(params.blockInstances.map((block) => [idOf(block), block]))
  const blockShapesById = new Map(params.blockShapes.map((shape) => [idOf(shape), shape]))
  const block = blockInstancesById.get(params.blockInstanceId)
  const shape = block ? blockShape(block, blockShapesById) : undefined
  if (!block || shape?.semanticType !== BLOCK_SHAPE_TYPES.TIME) {
    return { applies: false, title: 'Events', timeBlockName: '', eventNames: [] }
  }
  return {
    applies: true,
    title: `${shape.name} Events`,
    timeBlockName: block.name,
    eventNames: activeEventNamesForBlock(params.blockInstanceId, params.eventAssignments),
  }
}
