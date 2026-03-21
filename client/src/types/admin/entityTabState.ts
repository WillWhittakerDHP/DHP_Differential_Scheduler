import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityTabStateOptions<EntityKey extends GlobalEntityKey> {
  filteredEntities: Ref<GlobalEntity<EntityKey>[]>
  dragHandlers: {
    syncArrays: () => void
  }
}

export type UseEntityTabStateReturn = Record<string, never>
