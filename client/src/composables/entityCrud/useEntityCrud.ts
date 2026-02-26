import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntityKey } from '@/constants/entities'
import { createLogger } from '@/utils/logger'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrudMutations } from './useEntityCrudMutations'
import type { OrderIndexUpdate, BulkUpdate } from '@/types/entityCrud/entityCrudTypes'

export interface UseEntityCrudReturn<GlobalEntityTypeKey extends GlobalEntityKey> {
  entities: ComputedRef<GlobalEntity<GlobalEntityTypeKey>[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  create: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => Promise<GlobalEntity<GlobalEntityTypeKey>>
  update: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>, id: GlobalEntityId) => Promise<unknown>
  updateWithComponentCheck: (
    entity: Partial<GlobalEntity<GlobalEntityTypeKey>>,
    id: GlobalEntityId,
    onComputedPropertyChange?: (propertyKey: string, newValue: unknown) => void
  ) => Promise<unknown>
  remove: (id: GlobalEntityId) => Promise<{ deletedId: string }>
  patchOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  patchBulk: (updates: BulkUpdate<GlobalEntityTypeKey>) => Promise<void>
  refetch: () => Promise<void>
  isComposer: (id: GlobalEntityId) => boolean
  isComputedProperty: (propertyKey: string) => boolean
}

/**
 * PATTERN: Entity CRUD composable (facade)
 * Inlines former useEntityCrudQuery (entities from globalData), useEntityCrudState (isLoading, error, refetch), and useEntityCrudActions (mutations).
 */
export function useEntityCrud<GlobalEntityTypeKey extends GlobalEntityKey>(entityKey: GlobalEntityTypeKey): UseEntityCrudReturn<GlobalEntityTypeKey> {
  const logger = createLogger('useEntityCrud')
  const queryClient = useQueryClient()
  const { globalData } = useGlobal()

  const entities = computed((): GlobalEntity<GlobalEntityTypeKey>[] => {
    const data = globalData?.value
    if (!data || !data.entities || !data.entities[entityKey]) {
      return []
    }
    return data.entities[entityKey] as GlobalEntity<GlobalEntityTypeKey>[]
  })

  const isLoading = computed((): boolean => false)
  const error = computed((): unknown | undefined => undefined)

  const refetch = async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }

  const actions = useEntityCrudMutations({ entityKey, logger })

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
    isLoading,
    error,

    create: actions.create,
    update: actions.update,
    updateWithComponentCheck,
    remove: actions.remove,
    patchOrderIndex: actions.patchOrderIndex,
    patchBulk: actions.patchBulk,
    refetch,

    isComposer,
    isComputedProperty,
  }
}
