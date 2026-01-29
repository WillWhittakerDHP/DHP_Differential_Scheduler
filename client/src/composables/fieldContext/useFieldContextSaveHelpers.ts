/**
 * Field Context Save Helpers
 * 
 * LEARNING: Extracts save logic from useFieldContextActions to reduce complexity
 * WHY: Separates component entity, relationship, and regular field save logic into focused functions
 * PATTERN: Helper functions that handle specific save scenarios
 */

import { toRaw } from 'vue'
import type { AxiosError } from 'axios'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import type { CreateRelationshipPayload } from '@/types/relationships'
import { getRelationshipByParentChildEndpoint, getRelationshipEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import type { QueryClient } from '@tanstack/vue-query'
import type { UseFieldContextStateReturn } from './useFieldContextState'

/**
 * Parameters for saving component entity fields
 */
export interface SaveComponentEntityParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
}

/**
 * LEARNING: Save component entity field
 * WHY: Extracts component entity save logic from main save function
 * PATTERN: Helper function that handles component entity field updates
 */
export async function saveComponentEntityField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveComponentEntityParams<GE, FieldKey>
): Promise<void> {
  const { state } = params
  
  if (!state.composedEntityComposable) {
    throw new Error('Component entity composable not available')
  }

  const { addToComponent, removeFromComponent, getComponents } = state.composedEntityComposable

  const currentComponents = getComponents(String(state.entityId))
  const oldComponentIds = new Set(currentComponents.map((ea) => ea.childId))

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)
  const newComponentIds = Array.isArray(plainValue)
    ? new Set(plainValue.map((v: unknown) => String(v)))
    : plainValue
      ? new Set([String(plainValue)])
      : new Set<string>()

  const toAdd = Array.from(newComponentIds).filter((id) => !oldComponentIds.has(id))
  const toRemove = Array.from(oldComponentIds).filter((id) => !newComponentIds.has(id))

  const promises: Promise<void>[] = [
    ...toAdd.map((componentId, index) =>
      addToComponent({
        composerId: String(state.entityId),
        componentId,
        orderIndex: currentComponents.length + index,
      }).catch((error: unknown) => {
        const axiosErr = error as AxiosError
        if (axiosErr?.response?.status === 409) {
          return Promise.resolve()
        }
        throw error
      })
    ),
    ...toRemove.map((componentId) =>
      removeFromComponent({
        composerId: String(state.entityId),
        componentId,
      })
    ),
  ]

  await Promise.all(promises)
}

/**
 * Parameters for saving relationship fields
 */
export interface SaveRelationshipFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
  fieldKeyString: string
  queryClient: QueryClient
}

/**
 * LEARNING: Save relationship field
 * WHY: Extracts relationship field save logic from main save function
 * PATTERN: Helper function that handles relationship field updates
 */
export async function saveRelationshipField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveRelationshipFieldParams<GE, FieldKey>
): Promise<void> {
  const { state, currentEntity, fieldKeyString, queryClient } = params

  const relationshipKey = fieldKeyString as GlobalRelationshipKey
  const relationshipEndpoint = getRelationshipEndpoint(relationshipKey)

  const entityRecord = currentEntity as Record<string, ValidAdminValue | undefined>
  const currentValue = Object.prototype.hasOwnProperty.call(entityRecord, fieldKeyString)
    ? entityRecord[fieldKeyString]
    : undefined
  const oldValues = Array.isArray(currentValue)
    ? currentValue.map((v) => String(v))
    : currentValue
      ? [String(currentValue)]
      : []

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)
  const newValues = Array.isArray(plainValue)
    ? plainValue.map((v: unknown) => String(v))
    : plainValue
      ? [String(plainValue)]
      : []

  const parentId = String(state.entityId)
  const toAdd = newValues.filter((v) => !oldValues.includes(v))
  const toRemove = oldValues.filter((v) => !newValues.includes(v))

  const promises: Promise<void>[] = [
    ...toAdd.map((childId) => {
      const payload: CreateRelationshipPayload = {
        parent_id: parentId as GlobalEntityId,
        child_id: childId as GlobalEntityId,
      }
      return apiClient.post(relationshipEndpoint, payload).then(() => void 0)
    }),
    ...toRemove.map((childId) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(relationshipKey, parentId, childId)
      return apiClient.delete(deleteEndpoint).then(() => void 0)
    }),
  ]

  await Promise.all(promises)

  // LEARNING: Cleanup invalid active relationships for specific relationship keys
  // WHY: Ensures data consistency for cascade and parts relationships
  // PATTERN: Conditional cleanup for specific relationship types
  if (relationshipKey === 'validCascades' || relationshipKey === 'validParts') {
    try {
      const { cleanupInvalidActiveRelationships } = await import('@/utils/dependencyCleanup')
      await cleanupInvalidActiveRelationships(
        state.entityKey,
        state.entityId,
        relationshipKey,
        newValues as GlobalEntityId[],
        queryClient
      )
    } catch (error) {
      // Dependency cleanup failed (non-critical)
    }
  }

  // LEARNING: Invalidate and refetch queries after relationship updates
  // WHY: Ensures UI reflects latest relationship state
  // PATTERN: Invalidate related queries, then refetch global data
  queryClient.invalidateQueries({ queryKey: [relationshipKey] })
  queryClient.invalidateQueries({ queryKey: [state.entityKey] })
  await queryClient.refetchQueries({ queryKey: ['globalData'] })

  // LEARNING: Invalidate scheduler admin queries for specific entity types
  // WHY: BlockInstance and BlockShape changes affect scheduler admin state
  // PATTERN: Conditional invalidation for specific entity types
  if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
}

/**
 * Parameters for saving regular fields
 */
export interface SaveRegularFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  queryClient: QueryClient
}

/**
 * LEARNING: Save regular field (non-relationship, non-component)
 * WHY: Extracts regular field save logic from main save function
 * PATTERN: Helper function that handles standard field updates
 */
export async function saveRegularField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveRegularFieldParams<GE, FieldKey>
): Promise<void> {
  const { state, queryClient } = params

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)

  const patchPayload = {
    admin: {
      key: String(state.fieldKey),
      value: plainValue as ValidAdminValue,
    },
    dynamicId: String(state.entityId),
  }

  await state.patchFieldAsync(patchPayload)

  // LEARNING: Invalidate queries after field update
  // WHY: Ensures UI reflects latest field value
  // PATTERN: Invalidate entity queries, conditionally invalidate scheduler admin
  queryClient.invalidateQueries({ queryKey: [state.entityKey] })
  if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
  
  // LEARNING: After save, the store is updated optimistically
  // WHY: The watch on entityValue in useFieldContextState will sync the field value
  //      when it detects the store has updated and values match
  //      The watch on storeEntity in EntityCard will reset the form when values change
  // PATTERN: Let the reactive watches handle syncing - no need to manually reset here
  // NOTE: Optimistic update happens synchronously in onMutate, so store is updated immediately
  //      The watches will detect the change and sync accordingly
}
