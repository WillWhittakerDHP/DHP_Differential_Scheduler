/**
 * WHY: useShapeDisplayNames Composable

WHY: Moves display names map creation t...
 */
import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityDisplay } from './useEntityDisplay'

export interface UseShapeDisplayNamesReturn {
  blockShapeDisplayNames: ComputedRef<Map<string, string>>
  partShapeDisplayNames: ComputedRef<Map<string, string>>
}

/**
 * WHY: useShapeDisplayNames composable

WHY: Extracts display names map logic f...
 */
export function useShapeDisplayNames(): UseShapeDisplayNamesReturn {
  const { getGlobalEntities } = useGlobal()
  const { getEntityDisplayName } = useEntityDisplay()

  const blockShapeDisplayNames = computed(() => {
    const blockShapes = getGlobalEntities('blockShape')
    const map = new Map<string, string>()
    blockShapes.forEach(blockShape => {
      const displayName = getEntityDisplayName('blockShape', blockShape)
      map.set(blockShape.id, displayName)
    })
    return map
  })

  const partShapeDisplayNames = computed(() => {
    const partShapes = getGlobalEntities('partShape')
    const map = new Map<string, string>()
    partShapes.forEach(partShape => {
      const displayName = getEntityDisplayName('partShape', partShape)
      map.set(partShape.id, displayName)
    })
    return map
  })

  return {
    blockShapeDisplayNames,
    partShapeDisplayNames
  }
}

