import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityGroupingParams<
  EntityKey extends GlobalEntityKey,
  GroupKey extends GlobalEntityKey
> {
  entityKey: EntityKey
  groupKey: GroupKey
  groupBy: (entity: GlobalEntity<EntityKey>) => string
}

export interface UseEntityGroupingReturn<EntityKey extends GlobalEntityKey> {
  entitiesByGroup: ComputedRef<Map<string, GlobalEntity<EntityKey>[]>>
}
