/**
 * WHY: Build placeholder child entity for relationship collection (pure except caller-supplied defaults).
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface BuildNewRelationshipChildParams {
  shapeId: string
  childEntityKey: GlobalEntityKey
  shapeRefProperty: string
  defaults: Record<string, unknown>
  parentEntity: GlobalEntity<GlobalEntityKey> | null | undefined
  getShapeName: (shapeId: string) => string
  nameGenerator?: (
    parentName: string,
    shapeName: string,
    parentId: string,
    shapeId: string,
    existingChildren: GlobalEntity<GlobalEntityKey>[]
  ) => string
  existingChildren: GlobalEntity<GlobalEntityKey>[]
}

export function buildNewRelationshipChildEntity(
  params: BuildNewRelationshipChildParams
): GlobalEntity<GlobalEntityKey> {
  const {
    shapeId,
    childEntityKey,
    shapeRefProperty,
    defaults,
    parentEntity,
    getShapeName,
    nameGenerator,
    existingChildren,
  } = params

  const baseEntity = {
    id: `new-${shapeId}`,
    entityKey: childEntityKey,
    ...defaults,
    [shapeRefProperty]: shapeId,
  } as GlobalEntity<GlobalEntityKey>

  if (!parentEntity) {
    return baseEntity
  }

  const parentName = (parentEntity as { name?: string }).name || 'Parent'
  const shapeName = getShapeName(shapeId)

  if (nameGenerator) {
    const name = nameGenerator(parentName, shapeName, parentEntity.id, shapeId, existingChildren)
    return { ...baseEntity, name } as GlobalEntity<GlobalEntityKey>
  }

  return {
    ...baseEntity,
    name: `${parentName}-${shapeName}`,
  } as GlobalEntity<GlobalEntityKey>
}
