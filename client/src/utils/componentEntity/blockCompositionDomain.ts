/**
 * WHY: Block composer queries extracted from useComponentEntityDomain (pure given global snapshot).
 */

import type { GlobalEntityId, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { InstanceComponent } from '@/types/component'
import { findById } from '@/utils/collections/findById'

export function filterActiveComponentsForParent(
  components: InstanceComponent[] | null | undefined,
  composerId: GlobalEntityId
): InstanceComponent[] {
  if (!components || !Array.isArray(components)) {
    return []
  }
  return components.filter((ac) => ac.parentId === composerId && !ac.disabled)
}

export function blockInstanceIsComposable(
  instances: BlockInstanceEntity[],
  shapes: BlockShapeEntity[],
  blockInstanceId: GlobalEntityId
): boolean {
  const blockInstance = findById(instances, String(blockInstanceId)) as BlockInstanceEntity | undefined
  if (!blockInstance) {
    return false
  }
  const blockShape = findById(shapes, String(blockInstance.blockShapeRef)) as BlockShapeEntity | undefined
  return blockShape?.composable === true
}

export function availableComposablePeersForComposer(
  globalData: GlobalData,
  composerId: GlobalEntityId,
  activeForComposer: InstanceComponent[]
): BlockInstanceEntity[] {
  const instances = globalData.entities.blockInstance as BlockInstanceEntity[]
  const shapes = globalData.entities.blockShape as BlockShapeEntity[]

  const composer = findById(instances, String(composerId)) as BlockInstanceEntity | undefined
  if (!composer) {
    return []
  }

  const composerBlockShape = findById(shapes, String(composer.blockShapeRef)) as BlockShapeEntity | undefined
  if (!composerBlockShape || !composerBlockShape.composable) {
    return []
  }

  const existingComponentIds = new Set(activeForComposer.map((ac) => ac.childId))

  const candidateBlockInstances = instances.filter((bp) => {
    if (bp.blockShapeRef !== composer.blockShapeRef) {
      return false
    }
    const bpBlockShape = findById(shapes, String(bp.blockShapeRef)) as BlockShapeEntity | undefined
    return bpBlockShape?.composable === true
  })

  return candidateBlockInstances.filter((bp) => {
    if (bp.id === composerId) {
      return false
    }
    if (existingComponentIds.has(bp.id)) {
      return false
    }
    return true
  })
}

export function entityIsActiveComponent(
  components: InstanceComponent[] | null | undefined,
  entityId: GlobalEntityId
): boolean {
  if (!components || !Array.isArray(components)) {
    return false
  }
  return components.some((ac) => ac.childId === entityId && !ac.disabled)
}

export function composerIdForComponentChild(
  components: InstanceComponent[] | null | undefined,
  entityId: GlobalEntityId
): GlobalEntityId | null {
  if (!components || !Array.isArray(components)) {
    return null
  }
  const component = components.find((ac) => ac.childId === entityId && !ac.disabled)
  return component?.parentId ?? null
}
