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
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'
import { findRelationshipsByParent, extractChildIds } from '@/utils/transformers/relationshipTransformers'
import { useGlobal } from '@/composables/useGlobal'

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
        const entityRecord = entity as unknown as Record<string, unknown>
        const blockShapeRef = (entityRecord.blockShapeRef as string) || ''
        const blockShapeEntity = blockShapeRef ? getGlobalEntityById('blockShape', blockShapeRef) : null
        const blockShape = (blockShapeEntity as { name?: string } | null)?.name ?? ''
        const instance: BookingBlockInstance = {
          id: entity.id,
          entityKey: 'blockInstance',
          name: entity.name,
          baseSqFt: (entityRecord.baseSqFt as number) || 0,
          icon: (entityRecord.icon as string) || '',
          active: (entityRecord.active as boolean) ?? true,
          bookingMode: ((entity as unknown as { bookingMode?: import('@/constants/entities').BookingMode }).bookingMode ?? 'standalone') as import('@/constants/entities').BookingMode,
          differential: ((entityRecord.differential as boolean) ?? false) ? 'true' as const : 'false' as const,
          orderIndex: entity.orderIndex ?? 0,
          blockShape,
          blockShapeRef,
          activeBlockIds: (entityRecord.activeBlockIds as string[]) || [],
          partInstances: [],
          allowMultiple: (entity as unknown as { allowMultiple?: boolean }).allowMultiple === true,
          requiresUnitNumber:
            (entity as unknown as { requiresUnitNumber?: boolean | null }).requiresUnitNumber === true
              ? true
              : null,
          is_multi_family: (entity as unknown as { is_multi_family?: boolean }).is_multi_family ?? false,
          requires_agent: (entity as unknown as { requires_agent?: boolean }).requires_agent ?? false,
        }
        instances.push(instance)
      }
    }
    
    const eligibleInstances = instances.filter(instance => instance.bookingMode !== 'standalone')
    
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
