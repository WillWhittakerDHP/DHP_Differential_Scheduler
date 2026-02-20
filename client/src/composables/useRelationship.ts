/**
 * Relationship CRUD Composable
 * 
 * LEARNING: Provides CRUD operations for entity relationships
 * WHY: Encapsulates relationship management logic with Vue Query
 * PATTERN: Composable pattern for relationship operations
 * COMPARISON: React uses useRelationshipMutation hook. Vue uses composables.
 */

import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getRelationshipEndpoint, getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FetchedRelationship, CreateRelationshipPayload, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { useGlobal } from './useGlobal'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { cancelQueriesBeforeMutate, createRefetchGlobalDataHandler } from '@/composables/entityCrud/useSharedMutationHandlers'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useRelationship')

/**
 * Relationship CRUD composable
 * LEARNING: Provides full CRUD operations for relationships
 * WHY: Encapsulates all relationship operations in one composable
 * PATTERN: Composable that wraps Vue Query hooks
 * 
 * @param relationshipKey - The relationship type key (validCascades, validParts, bookingCascades, partAssignments, dependentInstances, instanceComponents)
 * @returns CRUD operations and relationship list
 */
export function useRelationshipCrud<RK extends GlobalRelationshipKey>(relationshipKey: RK) {
  const queryClient = useQueryClient()
  const { globalData } = useGlobal()
  const endpoint = getRelationshipEndpoint(relationshipKey)
  
  /**
   * LEARNING: Transform GlobalRelationship[] to FetchedRelationship[] format
   * WHY: Callers expect FetchedRelationship[] format (flat list)
   * PATTERN: Flatten GlobalRelationship[] (parent -> children[]) to FetchedRelationship[] (flat list)
   * NOTE: GlobalRelationship doesn't have id, disabled flag - we'll use defaults
   */
  function transformGlobalRelationshipsToFetched(relationships: GlobalRelationship[]): FetchedRelationship[] {
    const fetched: FetchedRelationship[] = []
    
    relationships.forEach((rel: GlobalRelationship) => {
      if (rel.relationshipKind !== relationshipKey) return
      
      rel.children.forEach((child: { id: string; entityKey: GlobalEntityKey }) => {
        fetched.push({
          id: toGlobalEntityId(`${rel.parent.id}-${child.id}`), // Synthetic ID
          kind: relationshipKey,
          parentKind: rel.parent.entityKey,
          childKind: child.entityKey,
          parentId: toGlobalEntityId(rel.parent.id),
          childId: toGlobalEntityId(child.id),
          disabled: false, // GlobalRelationship doesn't include disabled flag
        })
      })
    })
    
    return fetched
  }
  
  /**
   * LEARNING: Read relationships from globalData instead of direct API call
   * WHY: Centralized data flow - all data comes from globalData cache
   * PATTERN: Computed property that reads from globalData.relationships[relationshipKey]
   * ARCHITECTURAL CHANGE: Removed direct useQuery, now reads from globalData
   */
  const relationships = computed(() => {
    const data = globalData.value
    if (!data || !data.relationships || !data.relationships[relationshipKey]) {
      return []
    }
    
    // Transform GlobalRelationship[] to FetchedRelationship[] for backward compatibility
    return transformGlobalRelationshipsToFetched(data.relationships[relationshipKey])
  })
  
// WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)
  
  const refetch = refetchGlobalData
  
  const createMutation = useMutation({
    mutationFn: async (payload: CreateRelationshipPayload) => {
      const response = await apiClient.post<FetchedRelationship>(endpoint, payload)
      return response.data
    },
    onMutate: async (payload) => {
      // LEARNING: Optimistic update pattern for relationship creation
      // PATTERN: Cancel → Snapshot → Add relationship → Return context
      // PATTERN: Extract shared query cancellation logic
      await cancelQueriesBeforeMutate(queryClient, [['globalData']])
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      const { RELATIONSHIP_KEYS } = await import('@/constants/relationships')
      const config = RELATIONSHIP_KEYS[relationshipKey]
      if (!config) return { previousData }

      queryClient.setQueryData<GlobalData>(['globalData'], (old: GlobalData | undefined) => {
        if (!old) return old

        const currentRelationships = old.relationships[relationshipKey] || []
        const parentId = String(payload.parentId)
        const childId = String(payload.childId)

        const parentEntity = old.entities[config.parentEntity]?.find((e) => String(e.id) === parentId)
        const childEntity = old.entities[config.childEntity]?.find((e) => String(e.id) === childId)

        if (!parentEntity || !childEntity) {
          if (isDevModeEnabled()) {
            logger.warn('Parent or child entity not found for relationship', {
              relationshipKey,
              parentId,
              childId,
              parentFound: !!parentEntity,
              childFound: !!childEntity
            })
          }
          return old
        }

        const existingRelIndex = currentRelationships.findIndex(
          (rel: GlobalRelationship) => rel.parent.id === parentId && rel.children.some((c: { id: string }) => c.id === childId)
        )

        if (existingRelIndex !== -1) {
          return old
        }

        const parentRelIndex = currentRelationships.findIndex((rel) => rel.parent.id === parentId)
        
        if (parentRelIndex === -1) {
          const updatedRelationships = [
            ...currentRelationships,
            {
              relationshipKind: relationshipKey,
              parent: parentEntity,
              children: [childEntity],
            },
          ]
          return {
            ...old,
            relationships: {
              ...old.relationships,
              [relationshipKey]: updatedRelationships,
            },
          }
        } else {
          const updatedRelationships = [...currentRelationships]
          updatedRelationships[parentRelIndex] = {
            ...updatedRelationships[parentRelIndex],
            children: [...updatedRelationships[parentRelIndex].children, childEntity],
          }
          return {
            ...old,
            relationships: {
              ...old.relationships,
              [relationshipKey]: updatedRelationships,
            },
          }
        }
      })

      return { previousData }
    },
    onError: (_error: unknown, _payload: CreateRelationshipPayload, context: { previousData?: GlobalData } | undefined) => {
      // WHY: If creation fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: async ({ parentId, childId }: { parentId: GlobalEntityId; childId: GlobalEntityId }) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(
        relationshipKey, 
        String(parentId), 
        String(childId)
      )
      await apiClient.delete(deleteEndpoint)
    },
    onMutate: async ({ parentId, childId }) => {
      // LEARNING: Optimistic update pattern for relationship deletion
      // PATTERN: Cancel → Snapshot → Remove relationship → Return context
      // PATTERN: Extract shared query cancellation logic
      await cancelQueriesBeforeMutate(queryClient, [['globalData']])
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      queryClient.setQueryData<GlobalData>(['globalData'], (old: GlobalData | undefined) => {
        if (!old) return old

        const currentRelationships = old.relationships[relationshipKey] || []
        const parentIdStr = String(parentId)
        const childIdStr = String(childId)

        const parentRelIndex = currentRelationships.findIndex((rel: GlobalRelationship) => rel.parent.id === parentIdStr)

        if (parentRelIndex === -1) {
          return old
        }

        const parentRel = currentRelationships[parentRelIndex]
        const updatedChildren = parentRel.children.filter((child: { id: string }) => child.id !== childIdStr)

        if (updatedChildren.length === 0) {
          const updatedRelationships = currentRelationships.filter((_: GlobalRelationship, index: number) => index !== parentRelIndex)
          return {
            ...old,
            relationships: {
              ...old.relationships,
              [relationshipKey]: updatedRelationships,
            },
          }
        } else {
          const updatedRelationships = [...currentRelationships]
          updatedRelationships[parentRelIndex] = {
            ...parentRel,
            children: updatedChildren,
          }
          return {
            ...old,
            relationships: {
              ...old.relationships,
              [relationshipKey]: updatedRelationships,
            },
          }
        }
      })

      return { previousData }
    },
    onError: (_error: unknown, _variables: { parentId: GlobalEntityId; childId: GlobalEntityId }, context: { previousData?: GlobalData } | undefined) => {
      // WHY: If deletion fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })
  
  return {
    relationships,
    
    create: async (payload: CreateRelationshipPayload) => {
      const result = await createMutation.mutateAsync(payload)
      return result
    },
    remove: async (parentId: GlobalEntityId, childId: GlobalEntityId) => {
      await deleteMutation.mutateAsync({ parentId, childId })
    },
    refetch,
  }
}

