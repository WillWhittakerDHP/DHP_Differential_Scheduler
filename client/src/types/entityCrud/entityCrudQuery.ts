import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface UseEntityCrudQueryReturn<GlobalEntityTypeKey extends GlobalEntityKey> {
  entities: ComputedRef<GlobalEntity<GlobalEntityTypeKey>[]>
}
