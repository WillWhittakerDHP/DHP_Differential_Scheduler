/**
 * WHY: Instance Grouping Composable

WHY: Components should be thin UI wrappers...
 */
import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useGlobal } from '../useGlobal'
import { useAdmin } from './useAdmin'
import type { GlobalEntity } from '@/types/entities'
import { BLOCK_SHAPE_TYPES, type BlockShapeType } from '@/constants/blockShapeTypes'
import type { UseInstanceGroupingOptions, UseInstanceGroupingReturn } from '@/types/admin/instanceGrouping'
import { sortEntitiesByOrderIndex } from '@/utils/admin/sortEntitiesByOrderIndex'

/**
 * WHY: Instance Grouping Composable

WHY: Moves business logic out of component...
 */
export function useInstanceGrouping(
  options: UseInstanceGroupingOptions = {}
): UseInstanceGroupingReturn {
  const { activeTab, allowedBlockShapeTypes, orchestratorInstancesOnly } = options

  const { getGlobalData } = useGlobal()
  // WHY: Do not destructure `getEntities` — TS loses the generic overload and widens buckets to a union.
  const admin = useAdmin()

  const allowedTypesGetter: MaybeRefOrGetter<readonly BlockShapeType[] | undefined> | undefined =
    allowedBlockShapeTypes

  /**
   * NOTE: Uses getEntities() to ensure entities have relationships attached
   */
  const sortedBlockShapes = computed((): GlobalEntity<'blockShape'>[] => {
    const blockShapes = admin.getEntities('blockShape')
    const allowed = allowedTypesGetter !== undefined ? toValue(allowedTypesGetter) : undefined
    const filtered =
      allowed !== undefined && allowed.length > 0
        ? blockShapes.filter((bs) => allowed.includes(bs.semanticType as BlockShapeType))
        : blockShapes
    return sortEntitiesByOrderIndex<'blockShape'>([...filtered])
  })

  /**
   * NOTE: Uses getEntities() to ensure entities have relationships attached (e.g., instanceComponents)
   */
  const blockInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const blockShapes = sortedBlockShapes.value
    const blockInstances = admin.getEntities('blockInstance')

    // WHY: Functional approach avoids forEach with Map mutations
    // PATTERN: Reduce blockShapes into a Map of instances grouped by shape ID
    const orchestratorOnly =
      orchestratorInstancesOnly !== undefined ? toValue(orchestratorInstancesOnly) : false

    return blockShapes.reduce((map, blockShape) => {
      const instances = sortEntitiesByOrderIndex<'blockInstance'>(
        blockInstances
          .filter((bi) => bi.blockShapeRef === blockShape.id)
          .filter((bi) => (orchestratorOnly ? bi.orchestrator === true : true))
      )
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
    const blockShapes = sortedBlockShapes.value

    // WHY: Non-user shapes may host composite block instances (instance-level composite flag).
    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.semanticType !== BLOCK_SHAPE_TYPES.USER)
      return map
    }, new Map<string, boolean>())
  })

  const blockShapeStateControl = computed(() => {
    const blockShapes = sortedBlockShapes.value

    return blockShapes.reduce((map, blockShape) => {
      map.set(blockShape.id, blockShape.semanticType === BLOCK_SHAPE_TYPES.USER)
      return map
    }, new Map<string, boolean>())
  })

  /**
   */
  const blockShapeValidBookingCascades = computed(() => {
    const globalData = getGlobalData()
    const blockShapes = sortedBlockShapes.value

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
    if (!activeTab) return
    if (shapes.length > 0) {
      const v = activeTab.value
      const isShapeId = shapes.some((s) => s.id === v)
      if (!v || !isShapeId) {
        activeTab.value = shapes.find((shape) => shape.semanticType === BLOCK_SHAPE_TYPES.USER)?.id ?? shapes[0].id
      }
    } else {
      activeTab.value = ''
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
