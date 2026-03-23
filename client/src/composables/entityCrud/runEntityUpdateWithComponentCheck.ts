/**
 * WHY: Composer vs API update branch (useEntityCrud nesting audit).
 */

import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { isComputedEntityPropertyKey } from '@/utils/entityCrud/computedPartPropertyKeys'

export async function runEntityUpdateWithComponentCheck<GE extends GlobalEntityKey>(input: {
  entity: Partial<GlobalEntity<GE>>
  id: GlobalEntityId
  isComposerEntity: boolean
  mutateUpdate: (args: { entity: Partial<GlobalEntity<GE>>; id: GlobalEntityId }) => Promise<unknown>
  onComputedPropertyChange?: (propertyKey: string, newValue: unknown) => void
}): Promise<unknown | void> {
  const { entity, id, isComposerEntity, mutateUpdate, onComputedPropertyChange } = input

  if (!isComposerEntity) {
    return mutateUpdate({ entity, id })
  }

  const computedChanges = Object.entries(entity).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (isComputedEntityPropertyKey(key)) {
      acc[key] = value
    }
    return acc
  }, {})

  if (Object.keys(computedChanges).length === 0) {
    return mutateUpdate({ entity, id })
  }

  Object.entries(computedChanges).forEach(([key, value]) => {
    onComputedPropertyChange?.(key, value)
  })
}
