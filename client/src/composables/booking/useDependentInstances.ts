/**
 * useDependentInstances Composable
 * 
 * LEARNING: Extracts dependent instances from a parent block instance
 * WHY: Generic composable for resolving nested child options, not service-specific
 * PATTERN: Works with any block shape that has dependent instances
 * 
 * Dependent instances are lateral relationships (same or different shapes):
 * - Service A → Service B, Service C (dependent add-on services)
 * - Property Type A → Property Type B (dependent property options)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 * NOTE: Renamed from useDependentInstanceOptions to useDependentInstances (2026-01-20)
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'
import { findRelationshipsByParent, extractChildIds } from '@/utils/transformers/relationshipTransformers'
import { useGlobal } from '@/composables/useGlobal'
import { asEmptyString } from '@/utils/safeDefaults'

const logger = createLogger('useDependentInstances')

export interface UseDependentInstancesOptions {
  parentInstance: ComputedRef<BookingBlockInstance | null> | Ref<BookingBlockInstance | null>
  
  relationships?: ComputedRef<GlobalRelationship[]> | Ref<GlobalRelationship[]>
}

export interface UseDependentInstancesReturn {
  dependentInstanceIds: ComputedRef<string[]>
  
  dependentInstances: ComputedRef<BookingBlockInstance[]>
  
  hasDependentInstances: ComputedRef<boolean>
}

/**
 * useDependentInstances composable
 * 
 * LEARNING: Generic dependent instance resolution for any block instance
 * WHY: Decouples nested option logic from service-specific naming
 * PATTERN: Returns reactive computed properties for dependent instances
 * 
 * @example
 * ```ts
 * // Get dependent instances for a service
 * const { dependentInstances } = useDependentInstances({
 *   parentInstance: computed(() => selectedService.value)
 * })
 * ```
 */
export function useDependentInstances(
  options: UseDependentInstancesOptions
): UseDependentInstancesReturn {
  const { parentInstance, relationships: externalRelationships } = options
  const { getGlobalData, getGlobalEntityById } = useGlobal()
  
  /**
   * LEARNING: Get dependentInstances relationships
   * WHY: Need to find parent's dependent children
   * PATTERN: Use globalData relationships if not provided externally
   */
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
  
  /**
   * LEARNING: Extract dependent instance IDs from relationships
   * WHY: Find children of the parent instance
   * PATTERN: Use shared utility for relationship finding
   */
  const dependentInstanceIds = computed((): string[] => {
    const parent = parentInstance.value
    if (!parent) return []
    
    const parentRelationships = findRelationshipsByParent(
      parent.id,
      dependentInstanceRelationships.value
    )
    
    return extractChildIds(parentRelationships)
  })
  
  /**
   * LEARNING: Resolve dependent instance IDs to full instances
   * WHY: Need full instances for rendering (name, icon, description)
   * PATTERN: Look up each ID in global data
   */
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
