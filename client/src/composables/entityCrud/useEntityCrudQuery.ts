import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useGlobal } from '@/composables/useGlobal'

export type UseEntityCrudQueryReturn<GlobalEntityTypeKey extends GlobalEntityKey> = {
  entities: ComputedRef<GlobalEntity<GlobalEntityTypeKey>[]>
}

/**
 * Query/state module for `useEntityCrud`.
 *
 * PATTERN: query/state/actions separation
 * - query: computed reads from globalData cache
 * - actions live in `useEntityCrudActions`
 */
export function useEntityCrudQuery<GlobalEntityTypeKey extends GlobalEntityKey>(
  entityKey: GlobalEntityTypeKey
): UseEntityCrudQueryReturn<GlobalEntityTypeKey> {
  const { globalData } = useGlobal()

  const entities = computed((): GlobalEntity<GlobalEntityTypeKey>[] => {
    const data = globalData?.value
    if (!data || !data.entities || !data.entities[entityKey]) {
      return []
    }
    return data.entities[entityKey] as GlobalEntity<GlobalEntityTypeKey>[]
  })

  return { entities }
}


