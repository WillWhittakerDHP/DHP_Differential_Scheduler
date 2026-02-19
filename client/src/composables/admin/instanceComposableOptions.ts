/**
 * Shared options for instance composables that need blockInstancesByShape.
 * WHY: Single canonical shape for useInstanceBulkEdit and useInstanceFiltering.
 */

import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceBlockInstancesByShapeOptions {
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}
