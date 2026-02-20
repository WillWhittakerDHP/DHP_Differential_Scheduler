import type { ComputedRef } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import type { InstanceComponent, DistributionStrategy, DistributionPreview } from '@/types/component'
import { getComposedEntityFromRelationships, getComponentsRecursive } from '@/utils/transformers/relationshipTransformers'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

export type UseComponentEntityDomainParams<GE extends GlobalEntityKey> = {
  entityKey: GE
  getGlobalData: () => GlobalData | null
  instanceComponents: ComputedRef<InstanceComponent[]>
}

export type UseComponentEntityDomainReturn<GE extends GlobalEntityKey> = {
  canBeComposed: (blockInstanceId: GlobalEntityId) => boolean
  getAvailableComponents: (composerId: GlobalEntityId) => GlobalEntity<'blockInstance'>[]
  getComponents: (composerId: GlobalEntityId) => InstanceComponent[]
  isComponent: (entityId: GlobalEntityId) => boolean
  getComposerId: (entityId: GlobalEntityId) => GlobalEntityId | null
  getComposedEntity: (composerId: GlobalEntityId) => GlobalEntity<GE> | null
  calculateDistributionPreview: (
    composerId: GlobalEntityId,
    propertyKey: string,
    newValue: number,
    strategy: DistributionStrategy
  ) => DistributionPreview[]
}

export function useComponentEntityDomain<GE extends GlobalEntityKey>(
  params: UseComponentEntityDomainParams<GE>
): UseComponentEntityDomainReturn<GE> {
  const { entityKey, getGlobalData, instanceComponents } = params

  function getComponents(composerId: GlobalEntityId): InstanceComponent[] {
    const components = instanceComponents.value
    if (!components || !Array.isArray(components)) return []
    return components.filter((ac) => ac.parentId === composerId && !ac.disabled)
  }

  function canBeComposed(blockInstanceId: GlobalEntityId): boolean {
    if (entityKey !== 'blockInstance') return false
    const globalData = getGlobalData()
    if (!globalData) return false

    const blockInstance = findById(
      globalData.entities.blockInstance as BlockInstanceEntity[],
      String(blockInstanceId)
    ) as BlockInstanceEntity | undefined

    if (!blockInstance) {
      return false
    }

    const blockShape = findById(
      globalData.entities.blockShape as BlockShapeEntity[],
      String(blockInstance.blockShapeRef)
    ) as BlockShapeEntity | undefined

    return blockShape?.composable === true
  }

  function getAvailableComponents(composerId: GlobalEntityId): GlobalEntity<'blockInstance'>[] {
    if (entityKey !== 'blockInstance') return []
    const globalData = getGlobalData()
    if (!globalData) return []

    const composer = findById(
      globalData.entities.blockInstance as BlockInstanceEntity[],
      String(composerId)
    ) as BlockInstanceEntity | undefined

    if (!composer) {
      return []
    }

    const composerBlockShape = findById(
      globalData.entities.blockShape as BlockShapeEntity[],
      String(composer.blockShapeRef)
    ) as BlockShapeEntity | undefined

    if (!composerBlockShape || !composerBlockShape.composable) {
      return []
    }

    const existingComponentIds = new Set(getComponents(composerId).map((ac) => ac.childId))

    const candidateBlockInstances = (globalData.entities.blockInstance as BlockInstanceEntity[]).filter((bp) => {
      if (bp.blockShapeRef !== composer.blockShapeRef) return false

      const bpBlockShape = findById(
        globalData.entities.blockShape as BlockShapeEntity[],
        String(bp.blockShapeRef)
      ) as BlockShapeEntity | undefined

      return bpBlockShape?.composable === true
    })

    return candidateBlockInstances.filter((bp) => {
      if (bp.id === composerId) return false
      if (existingComponentIds.has(bp.id)) return false
      return true
    })
  }

  function isComponent(entityId: GlobalEntityId): boolean {
    if (entityKey !== 'blockInstance') return false
    const components = instanceComponents.value
    if (!components || !Array.isArray(components)) return false
    return components.some((ac) => ac.childId === entityId && !ac.disabled)
  }

  function getComposerId(entityId: GlobalEntityId): GlobalEntityId | null {
    if (entityKey !== 'blockInstance') return null
    const components = instanceComponents.value
    if (!components || !Array.isArray(components)) return null
    const component = components.find((ac) => ac.childId === entityId && !ac.disabled)
    return component?.parentId || null
  }

  function getComposedEntity(composerId: GlobalEntityId): GlobalEntity<GE> | null {
    const globalData = getGlobalData()
    if (!globalData) return null
    const componentRelationships = asEmptyArray(globalData.relationships.instanceComponents)

    return getComposedEntityFromRelationships(
      composerId,
      entityKey,
      componentRelationships,
      globalData.entities
    )
  }

  function calculateDistributionPreview(
    composerId: GlobalEntityId,
    propertyKey: string,
    newValue: number,
    strategy: DistributionStrategy
  ): DistributionPreview[] {
    const globalData = getGlobalData()
    if (!globalData) return []

    const componentRelationships = asEmptyArray(globalData.relationships.instanceComponents)
    const componentIds = getComponentsRecursive(composerId, entityKey, componentRelationships)

    const { resolved: components } = resolveByIds(
      asEmptyArray(globalData.entities[entityKey]),
      componentIds
    )

    if (components.length === 0) return []

    const currentValues = components.map((component: unknown) => {
      const value = (component as Record<string, unknown>)[propertyKey]
      return typeof value === 'number' ? value : 0
    })

    const totalCurrent = currentValues.reduce((sum, val) => sum + val, 0)

    const newValues = (() => {
      if (strategy === 'proportional') {
        if (totalCurrent === 0) {
          const equalValue = newValue / components.length
          return components.map(() => equalValue)
        }
        return currentValues.map((current) => (current / totalCurrent) * newValue)
      }

      if (strategy === 'equal') {
        const equalValue = newValue / components.length
        return components.map(() => equalValue)
      }

      return currentValues
    })()

    return components.map((component, index: number) => ({
      componentId: component.id,
      currentValue: currentValues[index],
      newValue: newValues[index],
      change: newValues[index] - currentValues[index],
    }))
  }

  return {
    canBeComposed,
    getAvailableComponents,
    getComponents,
    isComponent,
    getComposerId,
    getComposedEntity,
    calculateDistributionPreview,
  }
}


