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
import { toGlobalEntityId } from '@/types/entities'
import type { CreateRelationshipPayload } from '@/types/relationships'
import { getRelationshipByParentChildEndpoint, getRelationshipEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import { normalizePrimitiveForSave } from '@/utils/transformers/transformerPrimitives'
import type { QueryClient } from '@tanstack/vue-query'
import type { UseFieldContextStateReturn } from './useFieldContextState'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFieldContextSaveHelpers')

export interface SaveComponentEntityParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
}

export async function saveComponentEntityField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveComponentEntityParams<GE, FieldKey>
): Promise<void> {
  const { state } = params
  
  if (!state.composedEntityComposable) {
    throw new Error('Component entity composable not available')
  }

  const { addToComponent, removeFromComponent, getComponents } = state.composedEntityComposable

  const currentComponents = getComponents(toGlobalEntityId(String(state.entityId)))
  const oldComponentIds = new Set(currentComponents.map((ea) => ea.childId))

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)
  const newComponentIds = Array.isArray(plainValue)
    ? new Set(plainValue.map((v: unknown) => String(v).trim()).filter((s) => s !== ''))
    : plainValue
      ? new Set([String(plainValue).trim()].filter((s) => s !== ''))
      : new Set<string>()

  const toAdd = Array.from(newComponentIds).filter((id) => !oldComponentIds.has(toGlobalEntityId(id)))
  const toRemove = Array.from(oldComponentIds).filter((id) => !newComponentIds.has(String(id)))

  const promises: Promise<void>[] = [
    ...toAdd.map((componentId, index) =>
      addToComponent({
        composerId: toGlobalEntityId(String(state.entityId)),
        componentId: toGlobalEntityId(componentId),
        orderIndex: currentComponents.length + index,
      }).catch((error: unknown) => {
        logger.error('Add to component failed', { error })
        const axiosErr = error as AxiosError
        if (axiosErr?.response?.status === 409) {
          return Promise.resolve()
        }
        throw error
      })
    ),
    ...toRemove.map((componentId) =>
      removeFromComponent({
        composerId: toGlobalEntityId(String(state.entityId)),
        componentId: toGlobalEntityId(componentId),
      })
    ),
  ]

  await Promise.all(promises)
}

export interface SaveRelationshipFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
  fieldKeyString: string
  queryClient: QueryClient
}

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
    ? plainValue.map((v: unknown) => String(v).trim()).filter((s) => s !== '')
    : plainValue
      ? [String(plainValue).trim()].filter((s) => s !== '')
      : []

  const parentId = String(state.entityId)
  const toAdd = newValues.filter((v) => !oldValues.includes(v))
  const toRemove = oldValues.filter((v) => !newValues.includes(v))

  const promises: Promise<void>[] = [
    ...toAdd.map((childId) => {
      const payload: CreateRelationshipPayload = {
        parentId: toGlobalEntityId(parentId),
        childId: toGlobalEntityId(childId),
      }
      return apiClient.post(relationshipEndpoint, payload).then(() => void 0)
    }),
    ...toRemove.map((childId) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(relationshipKey, parentId, childId)
      return apiClient.delete(deleteEndpoint).then(() => void 0)
    }),
  ]

  await Promise.all(promises)

  // PATTERN: Conditional cleanup for specific relationship types
  if (relationshipKey === 'validCascades' || relationshipKey === 'validParts') {
    try {
      const { cleanupInvalidActiveRelationships } = await import('@/utils/dependencyCleanup')
      await cleanupInvalidActiveRelationships(
        state.entityKey,
        state.entityId,
        relationshipKey,
        newValues.map(toGlobalEntityId),
        queryClient
      )
    } catch (error) {
      logger.warn('Failed to cleanup invalid active relationships', { 
        error, 
        entityKey: state.entityKey, 
        relationshipKey 
      })
    }
  }

  // WHY: Ensures UI reflects latest relationship state
  // PATTERN: Invalidate related queries, then refetch global data
  queryClient.invalidateQueries({ queryKey: [relationshipKey] })
  queryClient.invalidateQueries({ queryKey: [state.entityKey] })
  await queryClient.refetchQueries({ queryKey: ['globalData'] })

  // WHY: BlockInstance and BlockShape changes affect scheduler admin state
  // PATTERN: Conditional invalidation for specific entity types
  if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
}

export interface SaveRegularFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  queryClient: QueryClient
}

export async function saveRegularField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveRegularFieldParams<GE, FieldKey>
): Promise<void> {
  const { state, queryClient } = params

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)
  const valueToSend = normalizePrimitiveForSave(plainValue)

  const patchPayload = {
    admin: {
      key: String(state.fieldKey),
      value: valueToSend as ValidAdminValue,
    },
    dynamicId: String(state.entityId),
  }

  await state.patchFieldAsync(patchPayload)

  // PATTERN: Invalidate entity queries, conditionally invalidate scheduler admin
  queryClient.invalidateQueries({ queryKey: [state.entityKey] })
  if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
  
  // PATTERN: Let the reactive watches handle syncing - no need to manually reset here
}
