/**
 * WHY: Atomic event cards pick exactly one part shape via a simple required select.
 * Orchestrators package atomic events — they do not set a part shape.
 */
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

export interface EventPartModifierShapeOption {
  id: string
  title: string
}

function entityId(entity: { id: unknown }): string {
  return String(entity.id)
}

/** All active catalog part shapes (simple picker). */
export function allActivePartShapeOptions(
  partShapes: readonly GlobalEntity<'partShape'>[]
): EventPartModifierShapeOption[] {
  return partShapes
    .filter((shape) => shape.active !== false)
    .map((shape) => ({ id: entityId(shape), title: shape.name }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function assignedPartShapeIdsForBlock(params: {
  blockInstanceId: string
  partAssignments: readonly GlobalRelationship[]
  partInstances: readonly GlobalEntity<'partInstance'>[]
}): Set<string> {
  const partById = new Map(params.partInstances.map((part) => [entityId(part), part]))
  const shapeIds = new Set<string>()
  for (const rel of params.partAssignments) {
    if (rel.parent.entityKey !== 'blockInstance') {
      continue
    }
    if (String(rel.parent.id) !== params.blockInstanceId) {
      continue
    }
    for (const child of rel.children) {
      if (child.entityKey !== 'partInstance') {
        continue
      }
      const part = partById.get(String(child.id))
      if (part && part.active !== false) {
        shapeIds.add(String(part.partShapeRef))
      }
    }
  }
  return shapeIds
}

/** First active modifier part instance linked to this event block (atomics keep one). */
export function firstAssignedPartInstanceForBlock(params: {
  blockInstanceId: string
  partAssignments: readonly GlobalRelationship[]
  partInstances: readonly GlobalEntity<'partInstance'>[]
}): GlobalEntity<'partInstance'> | null {
  const partById = new Map(params.partInstances.map((part) => [entityId(part), part]))
  for (const rel of params.partAssignments) {
    if (rel.parent.entityKey !== 'blockInstance') {
      continue
    }
    if (String(rel.parent.id) !== params.blockInstanceId) {
      continue
    }
    for (const child of rel.children) {
      if (child.entityKey !== 'partInstance') {
        continue
      }
      const part = partById.get(String(child.id))
      if (part && part.active !== false) {
        return part
      }
    }
  }
  return null
}
