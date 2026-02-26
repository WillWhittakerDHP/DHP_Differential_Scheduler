/**
 * WHY: Shared composable for getting shape entity from instance entity
PATTERN:...
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useAdmin } from '@/composables/admin/useAdmin'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { BlockShapeEntity, GlobalEntity, PartShapeEntity } from '@/types/entities'
import type { UseInstanceShapeOptions, UseInstanceShapeReturn } from '@/types/admin/instanceShape'


export function useInstanceShape(options: UseInstanceShapeOptions): UseInstanceShapeReturn {
  const { entityKey, entityId } = options
  const { globalData } = useGlobal()
  const adminComp = useAdmin()
  
  const entityIdRef = typeof entityId === 'string' ? computed(() => entityId) : entityId
  
  // PATTERN: Use adminComp.getEntity for consistency
  const instance = computed(() => {
    return adminComp.getEntity(entityKey, toGlobalEntityId(entityIdRef.value))
  })
  
  // LEARNING: Get shapeRef from instance - same pattern for both entity types
  // PATTERN: Extract shapeRef based on entity type
  const shapeRef = computed(() => {
    if (!instance.value) return null
    
    if (entityKey === 'blockInstance') {
      return (instance.value as GlobalEntity<'blockInstance'>).blockShapeRef || null
    } else {
      return (instance.value as GlobalEntity<'partInstance'>).partShapeRef || null
    }
  })
  
  // PATTERN: Use same lookup logic, only entity type differs
  const blockShape = computed((): BlockShapeEntity | null => {
    if (entityKey !== 'blockInstance' || !shapeRef.value) return null
    
    const shape = globalData.value?.entities?.blockShape?.find(
      bs => bs.id === shapeRef.value
    ) || null
        
    return shape as BlockShapeEntity | null
  })

  const partShape = computed((): PartShapeEntity | null => {
    if (entityKey !== 'partInstance' || !shapeRef.value) return null
    
    const shape = globalData.value?.entities?.partShape?.find(
      ps => ps.id === shapeRef.value
    ) || null
            
    return shape as PartShapeEntity | null
  })
  
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
