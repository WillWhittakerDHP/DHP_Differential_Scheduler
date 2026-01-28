import type { ComputedRef } from 'vue'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

type UseAnnotationAssignmentsStateReturn = {
  globalDataKey: readonly ['globalData']
  blockInstanceAnnotationsKey: readonly ['blockInstanceAnnotations', ComputedRef<string | undefined>]
  allBlockInstanceAnnotationsKey: readonly ['allBlockInstanceAnnotations']
  getBlockInstanceNameFromGlobalData: (globalData: GlobalData | undefined) => string | null
}

/**
 * State module: shared keys + small lookup helpers.
 * WHY: Keeps mutations focused on API and cache updates.
 */
export function useAnnotationAssignmentsState(
  blockInstanceId: ComputedRef<string | undefined>
): UseAnnotationAssignmentsStateReturn {
  const globalDataKey = ['globalData'] as const
  const blockInstanceAnnotationsKey = ['blockInstanceAnnotations', blockInstanceId] as const
  const allBlockInstanceAnnotationsKey = ['allBlockInstanceAnnotations'] as const

  const getBlockInstanceNameFromGlobalData = (globalData: GlobalData | undefined): string | null => {
    const id = blockInstanceId.value
    if (!id || !globalData) return null
    const blockInstances = globalData.entities.blockInstance || []
    const found = blockInstances.find((bi) => String(bi.id) === String(id))
    return found?.name ?? null
  }

  return {
    globalDataKey,
    blockInstanceAnnotationsKey,
    allBlockInstanceAnnotationsKey,
    getBlockInstanceNameFromGlobalData,
  }
}
import type { Ref } from 'vue'
import type { AnnotationAssignmentResponse } from '@/types/annotations'

type UseAnnotationAssignmentsStateReturn = {
  getMaxOrderIndex: () => number
}

/**
 * State module: derived helpers based on current assignment list.
 */
export function useAnnotationAssignmentsState(
  blockInstanceAnnotations: Ref<AnnotationAssignmentResponse[] | undefined>
): UseAnnotationAssignmentsStateReturn {
  const getMaxOrderIndex = (): number => {
    const current = blockInstanceAnnotations.value
    if (!current || current.length === 0) return -1
    return Math.max(...current.map((rel) => rel.orderIndex))
  }

  return {
    getMaxOrderIndex,
  }
}


