/**
 * useDependentInstanceOptions Composable
 * 
 * LEARNING: Extracts dependent instance options from a parent block instance
 * WHY: Generic composable for resolving nested child options, not service-specific
 * PATTERN: Works with any block shape that has dependent options
 * 
 * Dependent instance options are lateral relationships (same or different shapes):
 * - Service A → Service B, Service C (dependent add-on services)
 * - Property Type A → Property Type B (dependent property options)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'
import { findRelationshipsByParent, extractChildIds } from '@/utils/transformers/relationshipTransformers'
import { useGlobal } from '@/composables/useGlobal'

/**
 * Options for useDependentInstanceOptions composable
 */
export interface UseDependentInstanceOptionsOptions {
  /**
   * Parent block instance that may have dependent options
   */
  parentInstance: ComputedRef<BookingBlockInstance | null> | Ref<BookingBlockInstance | null>
  
  /**
   * Optional: Pre-filtered relationships (if available)
   * LEARNING: Avoids re-fetching if caller already has relationships
   */
  relationships?: ComputedRef<GlobalRelationship[]> | Ref<GlobalRelationship[]>
}

/**
 * Return type for useDependentInstanceOptions composable
 */
export interface UseDependentInstanceOptionsReturn {
  /**
   * IDs of dependent option instances
   */
  dependentOptionIds: ComputedRef<string[]>
  
  /**
   * Resolved dependent option instances with full data
   */
  dependentOptions: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Whether parent has any dependent options
   */
  hasDependentOptions: ComputedRef<boolean>
}

/**
 * useDependentInstanceOptions composable
 * 
 * LEARNING: Generic dependent option resolution for any block instance
 * WHY: Decouples nested option logic from service-specific naming
 * PATTERN: Returns reactive computed properties for dependent options
 * 
 * @example
 * ```ts
 * // Get dependent options for a service
 * const { dependentOptions } = useDependentInstanceOptions({
 *   parentInstance: computed(() => selectedService.value)
 * })
 * ```
 */
export function useDependentInstanceOptions(
  options: UseDependentInstanceOptionsOptions
): UseDependentInstanceOptionsReturn {
  const { parentInstance, relationships: externalRelationships } = options
  const { getGlobalData, getGlobalEntityById } = useGlobal()
  
  /**
   * LEARNING: Get dependentInstanceOptions relationships
   * WHY: Need to find parent's dependent children
   * PATTERN: Use globalData relationships if not provided externally
   */
  const dependentInstanceRelationships = computed((): GlobalRelationship[] => {
    if (externalRelationships?.value) {
      return externalRelationships.value.filter(
        rel => rel.relationshipKind === 'dependentInstanceOptions'
      )
    }
    
    const globalData = getGlobalData()
    if (!globalData?.relationships?.dependentInstanceOptions) return []
    
    return globalData.relationships.dependentInstanceOptions
  })
  
  /**
   * LEARNING: Extract dependent option IDs from relationships
   * WHY: Find children of the parent instance
   * PATTERN: Use shared utility for relationship finding
   */
  const dependentOptionIds = computed((): string[] => {
    const parent = parentInstance.value
    if (!parent) return []
    
    const parentRelationships = findRelationshipsByParent(
      parent.id,
      dependentInstanceRelationships.value
    )
    
    return extractChildIds(parentRelationships)
  })
  
  /**
   * LEARNING: Resolve dependent option IDs to full instances
   * WHY: Need full instances for rendering (name, icon, description)
   * PATTERN: Look up each ID in global data
   */
  const dependentOptions = computed((): BookingBlockInstance[] => {
    const ids = dependentOptionIds.value
    if (ids.length === 0) return []
    
    const instances: BookingBlockInstance[] = []
    
    for (const id of ids) {
      const entity = getGlobalEntityById('blockInstance', id)
      if (entity) {
        // Convert GlobalEntity to BookingBlockInstance format
        const instance: BookingBlockInstance = {
          id: entity.id,
          entityKey: 'blockInstance',
          name: entity.name,
          baseSqFt: (entity as unknown as Record<string, unknown>).baseSqFt as number || 0,
          description: (entity as unknown as Record<string, unknown>).description as string || '',
          icon: (entity as unknown as Record<string, unknown>).icon as string || '',
          active: (entity as unknown as Record<string, unknown>).active as boolean ?? true,
          dependent: (entity as unknown as { dependent?: boolean }).dependent === true,
          differential: (entity as unknown as Record<string, unknown>).differential as boolean ?? false,
          orderIndex: entity.orderIndex ?? 0,
          blockShape: (entity as unknown as Record<string, unknown>).blockShape as string || '',
          blockShapeRef: (entity as unknown as Record<string, unknown>).blockShapeRef as string || '',
          activeBlockIds: (entity as unknown as Record<string, unknown>).activeBlockIds as string[] || [],
          partInstances: [],
          allowMultiple: (entity as unknown as { allowMultiple?: boolean }).allowMultiple === true,
          requiresUnitNumber:
            (entity as unknown as { requiresUnitNumber?: boolean | null }).requiresUnitNumber === true
              ? true
              : null,
        }
        instances.push(instance)
      }
    }
    
    // Sort by orderIndex
    return instances.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })
  
  /**
   * LEARNING: Convenience flag for conditional rendering
   * WHY: Avoids length checks in templates
   */
  const hasDependentOptions = computed((): boolean => {
    return dependentOptions.value.length > 0
  })
  
  return {
    dependentOptionIds,
    dependentOptions,
    hasDependentOptions
  }
}

