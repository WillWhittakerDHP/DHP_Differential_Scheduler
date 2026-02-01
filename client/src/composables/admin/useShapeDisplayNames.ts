/**
 * useShapeDisplayNames Composable
 * 
 * LEARNING: Extracts shape display names map logic from ShapesTab component
 * WHY: Moves display names map creation to composable
 * PATTERN: Composable that provides computed maps of entity IDs to display names
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityDisplay } from './useEntityDisplay'

export interface UseShapeDisplayNamesReturn {
  blockShapeDisplayNames: ComputedRef<Map<string, string>>
  partShapeDisplayNames: ComputedRef<Map<string, string>>
}

/**
 * useShapeDisplayNames composable
 * 
 * LEARNING: Provides computed maps of entity IDs to display names
 * WHY: Extracts display names map logic from component to composable
 * PATTERN: Composable that returns reactive computed maps
 */
export function useShapeDisplayNames(): UseShapeDisplayNamesReturn {
  const { getGlobalEntities } = useGlobal()
  const { getEntityDisplayName } = useEntityDisplay()

  /**
   * LEARNING: Computed property for entity display names map
   * WHY: Provides reactive access to entity display names that updates when entity properties change
   * PATTERN: Map entity IDs to display names, recomputes when entities change
   */
  const blockShapeDisplayNames = computed(() => {
    const blockShapes = getGlobalEntities('blockShape')
    const map = new Map<string, string>()
    blockShapes.forEach(blockShape => {
      const displayName = getEntityDisplayName('blockShape', blockShape)
      map.set(String(blockShape.id), displayName)
    })
    return map
  })

  const partShapeDisplayNames = computed(() => {
    const partShapes = getGlobalEntities('partShape')
    const map = new Map<string, string>()
    partShapes.forEach(partShape => {
      const displayName = getEntityDisplayName('partShape', partShape)
      map.set(String(partShape.id), displayName)
    })
    return map
  })

  return {
    blockShapeDisplayNames,
    partShapeDisplayNames
  }
}

