import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useGlobal } from '@/composables/useGlobal'
import type { UseEntityCrudQueryReturn } from '@/types/entityCrud/entityCrudQuery'

export type { UseEntityCrudQueryReturn } from '@/types/entityCrud/entityCrudQuery'

/**
 * PATTERN: Query/state module for `useEntityCrud`
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


