/**
 * WHY: Instance Grouping Composable

WHY: Components should be thin UI wrappers...
 */
import { computed, watch } from 'vue'
import { useGlobal } from '../useGlobal'
import { useAdmin } from './useAdmin'
import type { GlobalEntity } from '@/types/entities'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { UseInstanceGroupingOptions, UseInstanceGroupingReturn } from '@/types/admin/instanceGrouping'

/**
 * WHY: Instance Grouping Composable

WHY: Moves business logic out of component...
 */
export function useInstanceGrouping(
  options: UseInstanceGroupingOptions = {}
): UseInstanceGroupingReturn {
  const { activeTab } = options
  
  const { getGlobalData } = useGlobal()
  const { getEntities } = useAdmin()

  /**
   * NOTE: Uses getEntities() to ensure entities have relationships attached
   */
  const sortedBlockShapes = computed(() => {
    const blockShapes = getEntities('blockShape')
    return [...blockShapes].sort((a, b) => a.orderIndex - b.orderIndex)
  })

  /**
   * NOTE: Uses getEntities() to ensure entities have relationships attached (e.g., instanceComponents)
   */
  const blockInstancesByShape = computed(() => {
    const blockShapes = getEntities('blockShape')
    const blockInstances = getEntities('blockInstance')
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of instances grouped by shape ID
    return blockShapes.reduce((map, blockShape) => {
      const instances = blockInstances
        .filter(bi => bi.blockShapeRef === blockShape.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)
      map.set(blockShape.id, instances)
      return map
    }, new Map<string, GlobalEntity<'blockInstance'>[]>())
  })

  /**
   */
  const blockInstancesCountByShape = computed(() => {
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Convert Map entries to array, then reduce into new Map
    return Array.from(blockInstancesByShape.value.entries()).reduce((map, [blockShapeId, instances]) => {
      map.set(blockShapeId, instances.length)
      return map
    }, new Map<string, number>())
  })

  const blockShapeComposable = computed(() => {
    const blockShapes = getEntities('blockShape')

    // WHY: Non-user shapes may host composite block instances (instance-level composite flag).
    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.type !== BLOCK_SHAPE_TYPES.USER)
      return map
    }, new Map<string, boolean>())
  })

  const blockShapeStateControl = computed(() => {
    const blockShapes = getEntities('blockShape')

    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.type === BLOCK_SHAPE_TYPES.USER)
      return map
    }, new Map<string, boolean>())
  })

  /**
   */
  const blockShapeValidBookingCascades = computed(() => {
    const globalData = getGlobalData()
    const blockShapes = getEntities('blockShape')
    
    if (!globalData || !globalData.relationships || !globalData.relationships.validBookingCascades) {
      return blockShapes.reduce((map, blockShape) => {
        map.set(blockShape.id, [])
        return map
      }, new Map<string, string[]>())
    }
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of valid cascade names
    return blockShapes.reduce((map, blockShape) => {
      const validBookingCascadeRels = globalData.relationships.validBookingCascades.filter(
        rel => rel.parent.id === blockShape.id
      )
      
      const cascadeNames = validBookingCascadeRels
        .flatMap(rel => rel.children)
        .map(child => child.name)
        .filter(Boolean) as string[]
      
      map.set(blockShape.id, cascadeNames)
      return map
    }, new Map<string, string[]>())
  })

  /**
   */
  watch(sortedBlockShapes, (shapes) => {
    if (activeTab && shapes.length > 0) {
      if (!activeTab.value || !shapes.some(s => s.id === activeTab.value)) {
        activeTab.value = shapes[0].id
      }
    }
  }, { immediate: true })

  return {
    sortedBlockShapes,
    blockInstancesByShape,
    blockInstancesCountByShape,
    blockShapeComposable,
    blockShapeStateControl,
    blockShapeValidBookingCascades
  }
}
