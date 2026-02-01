/**
 * Instance Grouping Composable
 * 
 * LEARNING: Extracts instance grouping and metadata logic from InstancesTab component
 * WHY: Components should be thin UI wrappers - grouping logic belongs in composables
 * PATTERN: Composable that provides grouped instances and BlockShape metadata
 * 
 * This composable handles:
 * - BlockInstance grouping by BlockShape
 * - BlockShape metadata (composable, state control, valid cascades)
 * - Instance counts per group
 * NOTE: Expansion state moved to useExpansionState composable (matches ShapesTab pattern)
 */

import { computed, watch, type ComputedRef, type Ref } from 'vue'
import { useGlobal } from '../useGlobal'
import { useAdmin } from '../useAdmin'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceGroupingOptions {
  activeTab?: Ref<string>
}

export interface UseInstanceGroupingReturn {
  sortedBlockShapes: ComputedRef<GlobalEntity<'blockShape'>[]>
  
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  
  blockInstancesCountByShape: ComputedRef<Map<string, number>>
  
  blockShapeComposable: ComputedRef<Map<string, boolean>>
  
  blockShapeStateControl: ComputedRef<Map<string, boolean>>
  
  blockShapeValidCascades: ComputedRef<Map<string, string[]>>
}

/**
 * Instance Grouping Composable
 * 
 * LEARNING: Provides instance grouping logic extracted from InstancesTab component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for grouping and metadata
 */
export function useInstanceGrouping(
  options: UseInstanceGroupingOptions = {}
): UseInstanceGroupingReturn {
  const { activeTab } = options
  
  const { getGlobalData } = useGlobal()
  const { getEntities } = useAdmin()

  /**
   * LEARNING: Computed property for BlockShapes sorted by orderIndex
   * WHY: Provides sorted list of BlockShapes for tab generation
   * PATTERN: Computed property that sorts entities
   * NOTE: Uses getEntities() to ensure entities have relationships attached
   */
  const sortedBlockShapes = computed(() => {
    const blockShapes = getEntities('blockShape')
    return [...blockShapes].sort((a, b) => a.orderIndex - b.orderIndex)
  })


  /**
   * LEARNING: Computed property for BlockInstances grouped by BlockShape
   * WHY: Groups BlockInstances by BlockShape for display in tabs
   * PATTERN: Computed property with Map data structure
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
      map.set(String(blockShape.id), instances)
      return map
    }, new Map<string, GlobalEntity<'blockInstance'>[]>())
  })

  /**
   * LEARNING: Computed map for BlockInstances count per BlockShape
   * WHY: Provides reactive count for each BlockShape without calling functions in template
   * PATTERN: Computed Map that derives from blockInstancesByShape
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
   * LEARNING: Computed property for BlockShape composable flags
   * WHY: Caches composable status per BlockShape to avoid reactive access during render
   * PATTERN: Computed Map that only recomputes when BlockShapes change
   */
  const blockShapeComposable = computed(() => {
    const blockShapes = getEntities('blockShape')
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of composable flags
    return blockShapes.reduce((map, blockShape) => {
      map.set(String(blockShape.id), blockShape.composable === true)
      return map
    }, new Map<string, boolean>())
  })

  /**
   * LEARNING: Computed property for BlockShape state control flags
   * WHY: Caches state control status per BlockShape to avoid reactive access during render
   * PATTERN: Computed Map that only recomputes when BlockShapes change
   */
  const blockShapeStateControl = computed(() => {
    const blockShapes = getEntities('blockShape')
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of state control flags
    return blockShapes.reduce((map, blockShape) => {
      map.set(String(blockShape.id), blockShape.isStateControl === true)
      return map
    }, new Map<string, boolean>())
  })

  /**
   * LEARNING: Computed property for BlockShape valid cascades
   * WHY: Caches valid cascades per BlockShape to avoid reactive access during render
   * PATTERN: Computed Map that only recomputes when globalData or BlockShapes change
   */
  const blockShapeValidCascades = computed(() => {
    const globalData = getGlobalData()
    const blockShapes = getEntities('blockShape')
    
    if (!globalData || !globalData.relationships || !globalData.relationships.validCascades) {
      return blockShapes.reduce((map, blockShape) => {
        map.set(String(blockShape.id), [])
        return map
      }, new Map<string, string[]>())
    }
    
    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of valid cascade names
    return blockShapes.reduce((map, blockShape) => {
      const validCascadeRels = globalData.relationships.validCascades.filter(
        rel => String(rel.parent.id) === String(blockShape.id)
      )
      
      const cascadeNames = validCascadeRels
        .flatMap(rel => rel.children)
        .map(child => child.name)
        .filter(Boolean) as string[]
      
      map.set(String(blockShape.id), cascadeNames)
      return map
    }, new Map<string, string[]>())
  })

  /**
   * LEARNING: Watcher for sortedBlockShapes (matches ShapesTab pattern of minimal watchers)
   * WHY: Handles active tab initialization
   * PATTERN: Single watcher for side effects (updating activeTab), not reactive data access
   */
  watch(sortedBlockShapes, (shapes) => {
    if (activeTab && shapes.length > 0) {
      if (!activeTab.value || !shapes.some(s => String(s.id) === activeTab.value)) {
        activeTab.value = String(shapes[0].id)
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

