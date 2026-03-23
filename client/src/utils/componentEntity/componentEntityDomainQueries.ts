import type { GlobalEntity, GlobalEntityId, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import { getComposedEntityFromRelationships, getComponentsRecursive } from '@/utils/transformers/relationshipTransformers'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type { GlobalEntityKey } from '@/constants/entities'
import type { DistributionStrategy, DistributionPreview, InstanceComponent } from '@/types/component'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'
import {
  availableComposablePeersForComposer,
  blockInstanceIsComposable,
  composerIdForComponentChild,
  entityIsActiveComponent,
  filterActiveComponentsForParent,
} from '@/utils/componentEntity/blockCompositionDomain'
import { distributionValuesForStrategy } from '@/utils/componentEntity/distributionPreviewValues'

type GetGlobalData = () => GlobalData | null

export function componentEntityGetComponents(
  instanceComponents: InstanceComponent[],
  composerId: GlobalEntityId
): InstanceComponent[] {
  return filterActiveComponentsForParent(instanceComponents, composerId)
}

export function componentEntityCanBeComposed(
  entityKey: GlobalEntityKey,
  getGlobalData: GetGlobalData,
  blockInstanceId: GlobalEntityId
): boolean {
  if (entityKey !== 'blockInstance') {
    return false
  }
  const globalData = getGlobalData()
  if (!globalData) {
    return false
  }
  return blockInstanceIsComposable(
    globalData.entities.blockInstance as BlockInstanceEntity[],
    globalData.entities.blockShape as BlockShapeEntity[],
    blockInstanceId
  )
}

export function componentEntityGetAvailableComponents(
  entityKey: GlobalEntityKey,
  getGlobalData: GetGlobalData,
  instanceComponents: InstanceComponent[],
  composerId: GlobalEntityId
): GlobalEntity<'blockInstance'>[] {
  if (entityKey !== 'blockInstance') {
    return []
  }
  const globalData = getGlobalData()
  if (!globalData) {
    return []
  }
  return availableComposablePeersForComposer(
    globalData,
    composerId,
    componentEntityGetComponents(instanceComponents, composerId)
  )
}

export function componentEntityIsComponent(
  entityKey: GlobalEntityKey,
  instanceComponents: InstanceComponent[],
  entityId: GlobalEntityId
): boolean {
  if (entityKey !== 'blockInstance') {
    return false
  }
  return entityIsActiveComponent(instanceComponents, entityId)
}

export function componentEntityGetComposerId(
  entityKey: GlobalEntityKey,
  instanceComponents: InstanceComponent[],
  entityId: GlobalEntityId
): GlobalEntityId | null {
  if (entityKey !== 'blockInstance') {
    return null
  }
  return composerIdForComponentChild(instanceComponents, entityId)
}

export function componentEntityGetComposedEntity<GE extends GlobalEntityKey>(
  entityKey: GE,
  getGlobalData: GetGlobalData,
  composerId: GlobalEntityId
): GlobalEntity<GE> | null {
  const globalData = getGlobalData()
  if (!globalData) {
    return null
  }
  const componentRelationships = asEmptyArray(globalData.relationships.instanceComponents)
  return getComposedEntityFromRelationships(
    composerId,
    entityKey,
    componentRelationships,
    globalData.entities as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  )
}

export function componentEntityCalculateDistributionPreview<GE extends GlobalEntityKey>(
  entityKey: GE,
  getGlobalData: GetGlobalData,
  composerId: GlobalEntityId,
  propertyKey: string,
  newValue: number,
  strategy: DistributionStrategy
): DistributionPreview[] {
  const globalData = getGlobalData()
  if (!globalData) {
    return []
  }
  const componentRelationships = asEmptyArray(globalData.relationships.instanceComponents)
  const componentIds = getComponentsRecursive(composerId, entityKey, componentRelationships)
  const { resolved: components } = resolveByIds(
    asEmptyArray(globalData.entities[entityKey] as GlobalEntity<GE>[]),
    componentIds
  )
  if (components.length === 0) {
    return []
  }
  const currentValues = components.map((component: unknown) => {
    const value = (component as Record<string, unknown>)[propertyKey]
    return typeof value === 'number' ? value : 0
  })
  const newValues = distributionValuesForStrategy(strategy, currentValues, newValue)
  return components.map((component, index: number) => ({
    componentId: component.id,
    currentValue: currentValues[index],
    newValue: newValues[index],
    change: newValues[index] - currentValues[index],
  }))
}
