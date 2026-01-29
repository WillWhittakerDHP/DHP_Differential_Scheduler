import type { Ref } from 'vue'
import type { AnnotationAssignmentResponse } from '@/types/annotations'

type UseAnnotationAssignmentsStateReturn = {
  getMaxOrderIndex: () => number
}

/**
 * State module: derived helpers based on current assignment list.
 * WHY: Keeps state concerns separate from mutation orchestration.
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
