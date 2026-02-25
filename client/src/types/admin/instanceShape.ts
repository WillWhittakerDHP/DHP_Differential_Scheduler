import type { ComputedRef } from 'vue'
import type { BlockShapeEntity, PartShapeEntity } from '@/types/entities'

export interface UseInstanceShapeOptions {
  entityKey: 'blockInstance' | 'partInstance'
  entityId: ComputedRef<string> | string
}

export interface UseInstanceShapeReturn {
  blockShape: ComputedRef<BlockShapeEntity | null>
  partShape: ComputedRef<PartShapeEntity | null>
  shape: ComputedRef<BlockShapeEntity | PartShapeEntity | null>
}
