import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceBlockInstancesByShapeOptions {
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}
