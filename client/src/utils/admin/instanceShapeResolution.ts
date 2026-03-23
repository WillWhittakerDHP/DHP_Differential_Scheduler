import type { BlockShapeEntity, GlobalEntity, PartShapeEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export function shapeRefFromInstance(
  entityKey: GlobalEntityKey,
  instance: GlobalEntity<GlobalEntityKey> | undefined
): string | null {
  if (!instance) return null
  if (entityKey === 'blockInstance') {
    return (instance as GlobalEntity<'blockInstance'>).blockShapeRef || null
  }
  return (instance as GlobalEntity<'partInstance'>).partShapeRef || null
}

export function computeBlockShapeForInstanceKey(
  entityKey: GlobalEntityKey,
  shapeRef: string | null,
  blockShapes: BlockShapeEntity[] | undefined
): BlockShapeEntity | null {
  if (entityKey !== 'blockInstance' || !shapeRef) return null
  return blockShapes?.find((bs) => bs.id === shapeRef) ?? null
}

export function computePartShapeForInstanceKey(
  entityKey: GlobalEntityKey,
  shapeRef: string | null,
  partShapes: PartShapeEntity[] | undefined
): PartShapeEntity | null {
  if (entityKey !== 'partInstance' || !shapeRef) return null
  return partShapes?.find((ps) => ps.id === shapeRef) ?? null
}

export function combinedInstanceShape(
  entityKey: GlobalEntityKey,
  blockShape: BlockShapeEntity | null,
  partShape: PartShapeEntity | null
): BlockShapeEntity | PartShapeEntity | null {
  if (entityKey === 'blockInstance') {
    return blockShape
  }
  return partShape
}
