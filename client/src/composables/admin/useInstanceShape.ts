/**
 * LEARNING: Shared composable for getting shape entity from instance entity
 * WHY: BlockInstance and PartInstance both need to get their shape entity to read fieldMetadata
 * PATTERN: Generic composable that works for both entity types using the same code path
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceShapeOptions {
  entityKey: 'blockInstance' | 'partInstance'
  entityId: ComputedRef<string> | string
}

export interface UseInstanceShapeReturn {
  /**
   * BlockShape entity (for blockInstance) or null
   */
  blockShape: ComputedRef<import('@/types/entities').BlockShapeEntity | null>
  
  /**
   * PartShape entity (for partInstance) or null
   */
  partShape: ComputedRef<import('@/types/entities').PartShapeEntity | null>
  
  /**
   * Get shape entity - returns blockShape for blockInstance, partShape for partInstance
   */
  shape: ComputedRef<import('@/types/entities').BlockShapeEntity | import('@/types/entities').PartShapeEntity | null>
}

/**
 * LEARNING: Get shape entity from instance entity
 * WHY: Both BlockInstance and PartInstance need their shape entity to read fieldMetadata
 * PATTERN: Single code path for both entity types - only the shape type differs
 */
export function useInstanceShape(options: UseInstanceShapeOptions): UseInstanceShapeReturn {
  const { entityKey, entityId } = options
  const { globalData } = useGlobal()
  const adminComp = useAdmin()
  
  const entityIdRef = typeof entityId === 'string' ? computed(() => entityId) : entityId
  
  // LEARNING: Get instance entity first
  // WHY: Need instance to get shapeRef
  // PATTERN: Use adminComp.getEntity for consistency
  const instance = computed(() => {
    return adminComp.getEntity(entityKey, entityIdRef.value)
  })
  
  // LEARNING: Get shapeRef from instance - same pattern for both entity types
  // WHY: BlockInstance has blockShapeRef, PartInstance has partShapeRef
  // PATTERN: Extract shapeRef based on entity type
  const shapeRef = computed(() => {
    if (!instance.value) return null
    
    if (entityKey === 'blockInstance') {
      return (instance.value as GlobalEntity<'blockInstance'>).blockShapeRef || null
    } else {
      return (instance.value as GlobalEntity<'partInstance'>).partShapeRef || null
    }
  })
  
  // LEARNING: Get shape entity from globalData - same code path for both
  // WHY: Both BlockShape and PartShape are in globalData.entities
  // PATTERN: Use same lookup logic, only entity type differs
  const blockShape = computed((): import('@/types/entities').BlockShapeEntity | null => {
    if (entityKey !== 'blockInstance' || !shapeRef.value) return null
    
    const shape = globalData.value?.entities?.blockShape?.find(
      bs => String(bs.id) === String(shapeRef.value)
    ) || null
        
    return shape as import('@/types/entities').BlockShapeEntity | null
  })
  
  const partShape = computed((): import('@/types/entities').PartShapeEntity | null => {
    if (entityKey !== 'partInstance' || !shapeRef.value) return null
    
    const shape = globalData.value?.entities?.partShape?.find(
      ps => String(ps.id) === String(shapeRef.value)
    ) || null
            
    return shape as import('@/types/entities').PartShapeEntity | null
  })
  
  // LEARNING: Unified shape getter - returns the appropriate shape based on entity type
  // WHY: Single code path for accessing shape entity
  const shape = computed(() => {
    if (entityKey === 'blockInstance') {
      return blockShape.value
    } else {
      return partShape.value
    }
  })
  
  return {
    blockShape,
    partShape,
    shape
  }
}
