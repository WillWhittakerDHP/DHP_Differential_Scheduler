/**
 * useCascadeInstances Composable
 * 
 * LEARNING: Extracts cascade instance IDs from a parent block instance
 * WHY: Generic composable for resolving booking cascades, not service-specific
 * PATTERN: Works with any block shape (user type, service, property, option)
 * 
 * Cascades are vertical hierarchy relationships (different shapes):
 * - User Type → Base Service (user type cascades to services)
 * - Base Service → Availability Option (service cascades to options)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * Options for useCascadeInstances composable
 */
export interface UseCascadeInstancesOptions {
  /**
   * Parent block instance that has booking cascades
   * LEARNING: activeBlockIds contains cascade child IDs
   */
  parentInstance: ComputedRef<BookingBlockInstance | null> | Ref<BookingBlockInstance | null>
  
  /**
   * Booking data containing all block instances
   */
  bookingData: Ref<BookingData | null>
  
  /**
   * Optional: Filter cascade instances by target block shape name
   * LEARNING: Without this, returns all cascaded instances regardless of shape
   * WHY: User Type cascades may include both Base Service and other shapes
   */
  targetBlockShapeName?: string
}

/**
 * Return type for useCascadeInstances composable
 */
export interface UseCascadeInstancesReturn {
  /**
   * IDs of cascade child instances
   */
  cascadeInstanceIds: ComputedRef<string[]>
  
  /**
   * Resolved cascade child instances
   */
  cascadeInstances: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Whether parent has any cascade instances
   */
  hasCascades: ComputedRef<boolean>
}

/**
 * useCascadeInstances composable
 * 
 * LEARNING: Generic cascade resolution for any block instance
 * WHY: Decouples cascade logic from service-specific naming
 * PATTERN: Returns reactive computed properties for cascade data
 * 
 * @example
 * ```ts
 * // Get services cascaded from selected user type
 * const { cascadeInstances } = useCascadeInstances({
 *   parentInstance: computed(() => selectedUserTypeBlock.value),
 *   bookingData: bookingData,
 *   targetBlockShapeName: 'Base Service'
 * })
 * ```
 */
export function useCascadeInstances(
  options: UseCascadeInstancesOptions
): UseCascadeInstancesReturn {
  const { parentInstance, bookingData, targetBlockShapeName } = options
  
  /**
   * LEARNING: Extract cascade IDs from parent's activeBlockIds
   * WHY: activeBlockIds is populated from bookingCascades relationship
   * PATTERN: Use activeBlockIds directly - already resolved by transformer
   */
  const cascadeInstanceIds = computed((): string[] => {
    const parent = parentInstance.value
    if (!parent) return []
    
    return parent.activeBlockIds || []
  })
  
  /**
   * LEARNING: Resolve cascade IDs to full instances
   * WHY: Need full instances for rendering (name, icon, description)
   * PATTERN: Filter bookingData.blockInstances by cascade IDs
   */
  const cascadeInstances = computed((): BookingBlockInstance[] => {
    const data = bookingData.value
    if (!data) return []
    
    const ids = new Set(cascadeInstanceIds.value)
    if (ids.size === 0) return []
    
    // Filter block instances by cascade IDs
    let instances = data.blockInstances.filter(
      instance => ids.has(instance.id)
    )
    
    // Optionally filter by target block shape
    if (targetBlockShapeName) {
      // Find block shape ID by name
      const targetShape = data.blockShapes.find(
        shape => shape.name === targetBlockShapeName
      )
      
      if (targetShape) {
        instances = instances.filter(
          instance => instance.blockShapeRef === targetShape.id
        )
      }
    }
    
    // Sort by orderIndex
    return instances.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })
  
  /**
   * LEARNING: Convenience flag for conditional rendering
   * WHY: Avoids length checks in templates
   */
  const hasCascades = computed((): boolean => {
    return cascadeInstances.value.length > 0
  })
  
  return {
    cascadeInstanceIds,
    cascadeInstances,
    hasCascades
  }
}

