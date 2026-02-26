/**
 * WHY: useDependentInstances Composable

WHY: Generic composable for resolving ...
 */
import { computed } from 'vue'
import { createLogger } from '@/utils/logger'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { findRelationshipsByParent, extractChildIds } from '@/utils/transformers/relationshipTransformers'
import { useGlobal } from '@/composables/useGlobal'
import { asEmptyString } from '@/utils/safeDefaults'
import type { GlobalRelationship } from '@/types/relationships'
import type { UseDependentInstancesOptions, UseDependentInstancesReturn } from '@/types/booking/dependentInstances'

export type { UseDependentInstancesOptions, UseDependentInstancesReturn } from '@/types/booking/dependentInstances'

const logger = createLogger('useDependentInstances')

export function useDependentInstances(
  options: UseDependentInstancesOptions
): UseDependentInstancesReturn {
  const { parentInstance, relationships: externalRelationships } = options
  const { getGlobalData, getGlobalEntityById } = useGlobal()
  
  const dependentInstanceRelationships = computed((): GlobalRelationship[] => {
    if (externalRelationships?.value) {
      return externalRelationships.value.filter(
        rel => rel.relationshipKind === 'dependentInstances'
      )
    }
    
    const globalData = getGlobalData()
    if (!globalData?.relationships?.dependentInstances) return []
    
    return globalData.relationships.dependentInstances
  })
  
  const dependentInstanceIds = computed((): string[] => {
    const parent = parentInstance.value
    if (!parent) return []
    
    const parentRelationships = findRelationshipsByParent(
      parent.id,
      dependentInstanceRelationships.value
    )
    
    return extractChildIds(parentRelationships)
  })
  
  const dependentInstances = computed((): BookingBlockInstance[] => {
    const ids = dependentInstanceIds.value
    if (ids.length === 0) return []
    
    const instances: BookingBlockInstance[] = []
    
    for (const id of ids) {
      const entity = getGlobalEntityById('blockInstance', id)
      if (entity) {
        const blockShapeRef = asEmptyString(entity.blockShapeRef)
        const blockShapeEntity = blockShapeRef ? getGlobalEntityById('blockShape', blockShapeRef) : null
        const blockShape = asEmptyString(blockShapeEntity?.name?.trim())
        if (!blockShape && blockShapeRef) logger.debug('block shape name missing', { blockShapeRef })
        const icon = asEmptyString(entity.icon?.trim())
        if (!icon) logger.debug('icon missing for blockInstance', { id })
        const activeBlockIds = Array.isArray(entity.instanceComponents) ? entity.instanceComponents.map(String) : []
        const instance: BookingBlockInstance = {
          id: entity.id,
          entityKey: 'blockInstance',
          name: entity.name,
          baseSqFt: entity.baseSqFt ?? 0,
          icon: icon || entity.icon,
          active: entity.active ?? true,
          bookingMode: entity.bookingMode ?? DEFAULT_VALUES.BOOKING_MODE,
          differential: entity.differential === 'true' ? 'true' as const : 'false' as const,
          orderIndex: entity.orderIndex ?? 0,
          blockShape: asEmptyString(blockShape || blockShapeEntity?.name),
          blockShapeRef,
          activeBlockIds,
          partInstances: [],
          allowMultiple: entity.allowMultiple === true,
          requiresUnitNumber: entity.requiresUnitNumber === true ? true : null,
          isMultiFamily: entity.isMultiFamily ?? false,
          requiresAgent: entity.requiresAgent ?? false,
        }
        instances.push(instance)
      }
    }
    
    const eligibleInstances = instances.filter(instance => instance.bookingMode !== DEFAULT_VALUES.BOOKING_MODE)
    
    return eligibleInstances.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })
  
  const hasDependentInstances = computed((): boolean => {
    return dependentInstances.value.length > 0
  })
  
  return {
    dependentInstanceIds,
    dependentInstances,
    hasDependentInstances
  }
}
