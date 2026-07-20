/**
 * WHY: Relationship CRUD Composable
 * PATTERN: Composable pattern for relationship create/remove with optimistic cache updates.
 */
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getRelationshipEndpoint, getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FetchedRelationship, CreateRelationshipPayload, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { useGlobal } from './useGlobal'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { cancelQueriesBeforeMutate, createRefetchGlobalDataHandler } from '@/composables/entityCrud/useSharedMutationHandlers'
import { createLogger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'

export interface UseRelationshipCrudReturn<_RK extends GlobalRelationshipKey> {
  relationships: ComputedRef<FetchedRelationship[]>
  create: (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
  remove: (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>
  refetch: () => Promise<void>
}

const logger = createLogger('useRelationship')

interface RelationshipKeyConfig {
  parentEntity: GlobalEntityKey
  childEntity: GlobalEntityKey
}

/** Pure: check if a parent-child pair already exists in the relationships array. */
function relationshipAlreadyExists(
  currentRelationships: GlobalRelationship[],
  parentId: string,
  childId: string,
  parentEntityKey?: GlobalEntityKey
): boolean {
  return currentRelationships.some(
    (rel) =>
      String(rel.parent.id) === parentId &&
      (parentEntityKey === undefined || rel.parent.entityKey === parentEntityKey) &&
      rel.children.some((c: { id: string }) => String(c.id) === childId)
  )
}

/** Pure: given current relationships, return array with parent group created or child appended. */
function findOrCreateParentRelationship(
  currentRelationships: GlobalRelationship[],
  parentId: string,
  parentEntity: GlobalEntity<GlobalEntityKey>,
  childEntity: GlobalEntity<GlobalEntityKey>,
  relationshipKey: GlobalRelationshipKey,
  propertyFactKey?: string
): GlobalRelationship[] {
  const parentRelIndex = currentRelationships.findIndex(
    (rel) =>
      String(rel.parent.id) === parentId && rel.parent.entityKey === parentEntity.entityKey
  )
  if (parentRelIndex === -1) {
    return [
      ...currentRelationships,
      {
        relationshipKind: relationshipKey,
        parent: parentEntity,
        children: [childEntity],
        ...(propertyFactKey !== undefined && { propertyFactKey }),
      },
    ]
  }
  const updated = [...currentRelationships]
  const existing = updated[parentRelIndex]
  updated[parentRelIndex] = {
    ...existing,
    children: [...existing.children, childEntity],
    ...(propertyFactKey !== undefined && { propertyFactKey }),
  }
  return updated
}

/**
 * WHY: event_assignments parents are either service/event blockInstance (baseline) or
 * partInstance (override). RELATIONSHIP_KEYS lists only blockInstance — resolve both.
 */
function resolveRelationshipParentEntity(
  old: GlobalData,
  relationshipKey: GlobalRelationshipKey,
  config: RelationshipKeyConfig,
  parentId: string
): GlobalEntity<GlobalEntityKey> | undefined {
  const primary = old.entities[config.parentEntity]?.find((e) => String(e.id) === parentId)
  if (primary) {
    return primary
  }
  if (relationshipKey === 'eventAssignments') {
    return old.entities.partInstance?.find((e) => String(e.id) === parentId)
  }
  return undefined
}

function addRelationshipToCache(
  old: GlobalData,
  relationshipKey: GlobalRelationshipKey,
  config: RelationshipKeyConfig,
  payload: CreateRelationshipPayload,
  logWarn: (msg: string, meta: unknown) => void
): GlobalData {
  const currentRelationships = asEmptyArray(old.relationships[relationshipKey])
  const parentId = String(payload.parentId)
  const childId = String(payload.childId)
  const parentEntity = resolveRelationshipParentEntity(old, relationshipKey, config, parentId)
  const childEntity = old.entities[config.childEntity]?.find((e) => String(e.id) === childId)

  if (!parentEntity || !childEntity) {
    if (isDevModeEnabled()) {
      logWarn('Parent or child entity not found for relationship', {
        relationshipKey,
        parentId,
        childId,
        parentFound: !!parentEntity,
        childFound: !!childEntity,
      })
    }
    return old
  }
  if (relationshipAlreadyExists(currentRelationships, parentId, childId, parentEntity.entityKey)) {
    return old
  }

  const updatedRelationships = findOrCreateParentRelationship(
    currentRelationships,
    parentId,
    parentEntity,
    childEntity,
    relationshipKey,
    payload.propertyFactKey
  )
  return {
    ...old,
    relationships: { ...old.relationships, [relationshipKey]: updatedRelationships },
  }
}

function removeRelationshipFromCache(
  old: GlobalData,
  relationshipKey: GlobalRelationshipKey,
  parentIdStr: string,
  childIdStr: string
): GlobalData {
  const currentRelationships = asEmptyArray(old.relationships[relationshipKey])
  const parentRelIndex = currentRelationships.findIndex(
    (rel: GlobalRelationship) => String(rel.parent.id) === parentIdStr
  )
  if (parentRelIndex === -1) return old
  const parentRel = currentRelationships[parentRelIndex]
  const updatedChildren = parentRel.children.filter(
    (child: { id: string }) => String(child.id) !== childIdStr
  )
  if (updatedChildren.length === 0) {
    const updatedRelationships = currentRelationships.filter(
      (_: GlobalRelationship, index: number) => index !== parentRelIndex
    )
    return {
      ...old,
      relationships: { ...old.relationships, [relationshipKey]: updatedRelationships },
    }
  }
  const updatedRelationships = [...currentRelationships]
  updatedRelationships[parentRelIndex] = { ...parentRel, children: updatedChildren }
  return {
    ...old,
    relationships: { ...old.relationships, [relationshipKey]: updatedRelationships },
  }
}

function transformGlobalRelationshipsToFetched<RK extends GlobalRelationshipKey>(
  relationships: GlobalRelationship[],
  relationshipKey: RK
): FetchedRelationship[] {
  return relationships.flatMap((rel) =>
    rel.relationshipKind !== relationshipKey
      ? []
      : rel.children.map((child) => ({
          id: toGlobalEntityId(`${rel.parent.id}-${child.id}`),
          kind: relationshipKey,
          parentKind: rel.parent.entityKey,
          childKind: child.entityKey,
          parentId: toGlobalEntityId(rel.parent.id),
          childId: toGlobalEntityId(child.id),
          disabled: false,
        }))
  )
}

interface OptimisticCreateHandlers {
  onMutate: (payload: CreateRelationshipPayload) => Promise<{ previousData?: GlobalData }>
  onError: (
    _error: unknown,
    _payload: CreateRelationshipPayload,
    context: { previousData?: GlobalData } | undefined
  ) => void
}

function createAddToCacheUpdater(
  relationshipKey: GlobalRelationshipKey,
  config: RelationshipKeyConfig,
  payload: CreateRelationshipPayload,
  logWarn: (msg: string, meta: unknown) => void
): (old: GlobalData | undefined) => GlobalData | undefined {
  return (old: GlobalData | undefined) =>
    !old ? old : addRelationshipToCache(old, relationshipKey, config, payload, logWarn)
}

function createOptimisticCreate(
  queryClient: ReturnType<typeof useQueryClient>,
  relationshipKey: GlobalRelationshipKey,
  log: ReturnType<typeof createLogger>
): OptimisticCreateHandlers {
  return {
    onMutate: async (payload: CreateRelationshipPayload) => {
      await cancelQueriesBeforeMutate(queryClient, [['globalData']])
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      const { RELATIONSHIP_KEYS } = await import('@/constants/relationships')
      const config = RELATIONSHIP_KEYS[relationshipKey]
      if (!config) return { previousData }
      const updater = createAddToCacheUpdater(
        relationshipKey,
        config,
        payload,
        (msg, meta) => log.warn(msg, meta)
      )
      queryClient.setQueryData<GlobalData>(['globalData'], updater)
      return { previousData }
    },
    onError: (_error: unknown, _payload: CreateRelationshipPayload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}

interface OptimisticDeleteHandlers {
  onMutate: (variables: { parentId: GlobalEntityId; childId: GlobalEntityId }) => Promise<{ previousData?: GlobalData }>
  onError: (
    _error: unknown,
    _variables: { parentId: GlobalEntityId; childId: GlobalEntityId },
    context: { previousData?: GlobalData } | undefined
  ) => void
}

function createRemoveFromCacheUpdater(
  relationshipKey: GlobalRelationshipKey,
  parentIdStr: string,
  childIdStr: string
): (old: GlobalData | undefined) => GlobalData | undefined {
  return (old: GlobalData | undefined) =>
    !old ? old : removeRelationshipFromCache(old, relationshipKey, parentIdStr, childIdStr)
}

function createOptimisticDelete(
  queryClient: ReturnType<typeof useQueryClient>,
  relationshipKey: GlobalRelationshipKey
): OptimisticDeleteHandlers {
  return {
    onMutate: async ({ parentId, childId }) => {
      await cancelQueriesBeforeMutate(queryClient, [['globalData']])
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      const updater = createRemoveFromCacheUpdater(
        relationshipKey,
        String(parentId),
        String(childId)
      )
      queryClient.setQueryData<GlobalData>(['globalData'], updater)
      return { previousData }
    },
    onError: (_error: unknown, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}

export function useRelationshipCrud<RK extends GlobalRelationshipKey>(relationshipKey: RK): UseRelationshipCrudReturn<RK> {
  const queryClient = useQueryClient()
  const { globalData } = useGlobal()
  const endpoint = getRelationshipEndpoint(relationshipKey)
  const refetch = createRefetchGlobalDataHandler(queryClient)

  const relationships = computed(() => {
    const data = globalData.value
    if (!data?.relationships?.[relationshipKey]) return []
    return transformGlobalRelationshipsToFetched(data.relationships[relationshipKey], relationshipKey)
  })

  const createHandlers = createOptimisticCreate(queryClient, relationshipKey, logger)
  const deleteHandlers = createOptimisticDelete(queryClient, relationshipKey)

  const createMutation = useMutation<FetchedRelationship, Error, CreateRelationshipPayload, { previousData?: GlobalData }>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<FetchedRelationship>(endpoint, payload)
      return response.data
    },
    onMutate: createHandlers.onMutate,
    onError: createHandlers.onError,
  })

  const deleteMutation = useMutation<void, Error, { parentId: GlobalEntityId; childId: GlobalEntityId }, { previousData?: GlobalData }>({
    mutationFn: async ({ parentId, childId }) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(
        relationshipKey,
        String(parentId),
        String(childId)
      )
      await apiClient.delete(deleteEndpoint)
    },
    onMutate: deleteHandlers.onMutate,
    onError: deleteHandlers.onError,
  })

  return {
    relationships,
    create: (payload) => createMutation.mutateAsync(payload),
    remove: (parentId, childId) => deleteMutation.mutateAsync({ parentId, childId }),
    refetch,
  }
}
