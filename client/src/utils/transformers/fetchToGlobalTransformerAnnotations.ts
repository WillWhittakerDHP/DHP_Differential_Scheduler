import type { GlobalEntity } from '@/types/entities'
import type { FetchedRelationship } from '@/types/relationships'
import type { AnnotationAssignmentEdge } from '@/types/transformers/globalData'

export function buildAnnotationAssignmentEdges(fetched: FetchedRelationship[]): AnnotationAssignmentEdge[] {
  return fetched
    .filter((r) => r.kind === 'annotationAssignments' && !r.disabled)
    .map((r) => ({
      blockInstanceId: r.parentId,
      annotationInstanceId: r.childId,
      userTypeBlockInstanceId: r.userTypeBlockInstanceId ?? null,
      orderIndex: typeof r.orderIndex === 'number' ? r.orderIndex : 0,
    }))
}

/**
 * Card title and list labels use `name`. Annotation copy lives in `text` — keep the title as the
 * annotation **shape** name (FK `type` → annotation_shapes.id) so long bodies do not replace it.
 */
export function applyAnnotationInstanceDisplayNames(
  entities: GlobalEntity<'annotationInstance'>[],
  shapes: GlobalEntity<'annotationShape'>[]
): GlobalEntity<'annotationInstance'>[] {
  const shapeById = new Map<string, GlobalEntity<'annotationShape'>>(shapes.map((s) => [String(s.id), s]))
  return entities.map((entity) => {
    const shape = shapeById.get(String(entity.type))
    const shapeName = shape != null && typeof shape.name === 'string' ? shape.name.trim() : ''
    if (shapeName !== '') {
      return { ...entity, name: shapeName }
    }
    if (entity.name != null && String(entity.name).trim() !== '') {
      return entity
    }
    if (entity.text != null && String(entity.text).trim() !== '') {
      return { ...entity, name: String(entity.text) } as GlobalEntity<'annotationInstance'>
    }
    return entity
  })
}
