import type { ComputedRef } from 'vue'

export interface UseShapeDisplayNamesReturn {
  blockShapeDisplayNames: ComputedRef<Map<string, string>>
  partShapeDisplayNames: ComputedRef<Map<string, string>>
}
