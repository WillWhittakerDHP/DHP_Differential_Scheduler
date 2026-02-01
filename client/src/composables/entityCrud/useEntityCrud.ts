import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntityKey } from '@/constants/entities'
import { useComponentEntity } from '@/composables/useComponentEntity'
import { createLogger } from '@/utils/logger'
import { useEntityCrudQuery } from './useEntityCrudQuery'
import { useEntityCrudActions } from './useEntityCrudActions'

/**
 * Entity CRUD composable (facade).
 *
 * PATTERN: query/state/actions separation
 * - state: computed `entities` read from globalData cache
 * - actions: mutations that refetch `['globalData']`
 * - domain helpers: composer + computed-property detection
 *
 * NOTE: This is a mechanical extraction from legacy `src/composables/useEntity.ts` to reduce file size.
 */
export function useEntityCrud<GlobalEntityTypeKey extends GlobalEntityKey>(entityKey: GlobalEntityTypeKey) {
  const logger = createLogger('useEntityCrud')
  const queryClient = useQueryClient()

  const { entities } = useEntityCrudQuery(entityKey)
  const actions = useEntityCrudActions({ entityKey, logger })

  const composedEntity = useComponentEntity(entityKey)

  function isComposer(entityId: GlobalEntityId): boolean {
    const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
    if (!currentGlobalData) return false

    const entity = currentGlobalData.entities[entityKey]?.find((e) => e.id === entityId)
    return entity?.isComposer ?? false
  }

  function isComputedProperty(propertyKey: string): boolean {
    const computedProperties = ['baseFee', 'baseTime', 'rateOverBaseFee', 'rateOverBaseTime', 'partAssignments']
    return computedProperties.includes(propertyKey)
  }

  async function updateWithComponentCheck(
    entity: Partial<GlobalEntity<GlobalEntityTypeKey>>,
    id: GlobalEntityId,
    onComputedPropertyChange?: (propertyKey: string, newValue: unknown) => void
  ) {
    const isComposerEntity = isComposer(id)

    if (isComposerEntity) {
      const computedChanges = Object.entries(entity).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (isComputedProperty(key)) {
          return { ...acc, [key]: value }
        }
        return acc
      }, {})

      if (Object.keys(computedChanges).length > 0) {
        Object.entries(computedChanges).forEach(([key, value]) => {
          onComputedPropertyChange?.(key, value)
        })
        return
      }
    }

    return actions.updateMutation.mutateAsync({ entity, id })
  }

  return {
    entities,
    isLoading: actions.isLoading,
    error: actions.error,

    create: actions.create,
    update: actions.update,
    updateWithComponentCheck,
    remove: actions.remove,
    patchOrderIndex: actions.patchOrderIndex,
    patchBulk: actions.patchBulk,
    refetch: actions.refetch,

    isComposer,
    isComputedProperty,
    composedEntity,
  }
}


