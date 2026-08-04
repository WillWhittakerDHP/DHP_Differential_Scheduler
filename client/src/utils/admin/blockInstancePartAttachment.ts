/**
 * WHY: Create/attach part instances (work items) on block cards.
 * Parts hold the values; blocks only mean something once parts are assigned.
 */
import type { GlobalEntity } from '@/types/entities'

export interface PartShapeAttachOption {
  id: string
  title: string
}

function entityId(entity: { id: unknown }): string {
  return String(entity.id)
}

/**
 * Part shapes still available to attach on this block.
 * Prefer the block shape’s validPartCascades when non-empty; otherwise all active shapes.
 * Already-attached shapes are omitted (one work item per part shape per block).
 */
export function partShapesAvailableToAttach(params: {
  partShapes: readonly GlobalEntity<'partShape'>[]
  attachedPartShapeIds: ReadonlySet<string>
  /** Shape-level allow-list from validPartCascades; empty/null = all active shapes. */
  allowedPartShapeIds?: ReadonlySet<string> | readonly string[] | null
}): PartShapeAttachOption[] {
  const attached = params.attachedPartShapeIds
  const allowed =
    params.allowedPartShapeIds == null
      ? null
      : new Set([...params.allowedPartShapeIds].map(String).filter((id) => id.trim() !== ''))
  const hasAllowList = allowed != null && allowed.size > 0

  return params.partShapes
    .filter((shape) => {
      if (shape.active === false) {
        return false
      }
      const id = entityId(shape)
      if (attached.has(id)) {
        return false
      }
      if (hasAllowList && !allowed!.has(id)) {
        return false
      }
      return true
    })
    .map((shape) => ({ id: entityId(shape), title: shape.name }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function defaultPartInstanceName(blockName: string, shapeName: string): string {
  return `${blockName}-${shapeName}`
}
