import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityFilteringReturn<EntityKey extends GlobalEntityKey> {
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
}
