/**
 * WHY: Immutable append of a new entity into TanStack globalData cache (pure).
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

export function appendEntityToGlobalDataEntities(
  old: GlobalData | undefined,
  childEntityKey: GlobalEntityKey,
  createdEntity: GlobalEntity<GlobalEntityKey>
): GlobalData | undefined {
  if (!old) {
    return old
  }
  const rawEntities = old.entities[childEntityKey]
  const currentEntities = rawEntities !== undefined && rawEntities !== null ? rawEntities : []
  const entityExists = currentEntities.some((e) => String(e.id) === String(createdEntity.id))
  if (!entityExists) {
    return {
      ...old,
      entities: {
        ...old.entities,
        [childEntityKey]: [...currentEntities, createdEntity],
      },
    }
  }
  return old
}
