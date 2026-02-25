/**
 * WHY: Instance Grouping Composable

WHY: Components should be thin UI wrappers...
 */
import { computed, watch } from 'vue'
import { useGlobal } from '../useGlobal'
import { useAdmin } from './useAdmin'
import type { GlobalEntity } from '@/types/entities'
import type { UseInstanceGroupingOptions, UseInstanceGroupingReturn } from '@/types/admin/instanceGrouping'

export type { UseInstanceGroupingOptions, UseInstanceGroupingReturn } from '@/types/admin/instanceGrouping'

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

  /**
LEARNING: Computed property for BlockShape composable flags
WHY: Cac...
   */
  const blockShapeComposable = computed(() => {
    const blockShapes = getEntities('blockShape')
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of composable flags
    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.composable === true)
      return map
    }, new Map<string, boolean>())
  })

  /**
LEARNING: Computed property for BlockShape state control flags
WHY: ...
   */
  const blockShapeStateControl = computed(() => {
    const blockShapes = getEntities('blockShape')
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of state control flags
    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.isStateControl === true)
      return map
    }, new Map<string, boolean>())
  })

  /**
   */
  const blockShapeValidCascades = computed(() => {
    const globalData = getGlobalData()
    const blockShapes = getEntities('blockShape')
    
    if (!globalData || !globalData.relationships || !globalData.relationships.validCascades) {
      return blockShapes.reduce((map, blockShape) => {
        map.set(blockShape.id, [])
        return map
      }, new Map<string, string[]>())
    }
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of valid cascade names
    return blockShapes.reduce((map, blockShape) => {
      const validCascadeRels = globalData.relationships.validCascades.filter(
        rel => rel.parent.id === blockShape.id
      )
      
      const cascadeNames = validCascadeRels
        .flatMap(rel => rel.children)
        .map(child => child.name)
        .filter(Boolean) as string[]
      
      map.set(blockShape.id, cascadeNames)
      return map
    }, new Map<string, string[]>())
  })

  /**
   * LEARNING: Watcher for sortedBlockShapes (matches ShapesTab pattern of minimal watchers)
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
    blockShapeValidCascades
  }
}

