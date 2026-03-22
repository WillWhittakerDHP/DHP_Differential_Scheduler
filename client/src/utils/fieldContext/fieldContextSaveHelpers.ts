/**
 * WHY: Pure helpers for persisting field values (component, relationship, regular); moved from composables (utils-in-disguise).
 */
import { toRaw } from 'vue'
import type { AxiosError } from 'axios'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { CreateRelationshipPayload } from '@/types/relationships'
import { getRelationshipByParentChildEndpoint, getRelationshipEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import { normalizePrimitiveForSave } from '@/utils/transformers/transformerPrimitives'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'
import { createLogger } from '@/utils/logger'
import { invalidateEntityQueries } from '@/composables/entityCrud/useSharedMutationHandlers'

import type { SaveComponentEntityParams, SaveRelationshipFieldParams, SaveRegularFieldParams } from '@/types/fieldContext/fieldContextSaveHelpers'

export type { SaveComponentEntityParams, SaveRelationshipFieldParams, SaveRegularFieldParams } from '@/types/fieldContext/fieldContextSaveHelpers'

const logger = createLogger('fieldContextSaveHelpers')

export async function saveComponentEntityField<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: SaveComponentEntityParams<GE, FieldKey>
): Promise<void> {
  const { state } = params

  if (!state.composedEntityComposable) {
    throw new Error('Component entity composable not available')
  }

  const { data, actions } = state.composedEntityComposable
  const { addToComponent, removeFromComponent } = actions
  const { getComponents } = data

  const currentComponents = getComponents(toGlobalEntityId(String(state.entityId)))
  const oldComponentIds = new Set(currentComponents.map((ea: { childId: string }) => ea.childId))

  const rawValue = state.value.value
  const plainValue = toRaw(rawValue)
  const newComponentIds = Array.isArray(plainValue)
    ? new Set(plainValue.map((v: unknown) => String(v).trim()).filter((s) => s !== ''))
    : plainValue
      ? new Set([String(plainValue).trim()].filter((s) => s !== ''))
      : new Set<string>()

  const oldIds = Array.from(oldComponentIds).map((id) => String(id))
  const newIds = Array.from(newComponentIds).map((id) => toGlobalEntityId(id))
  const { toAdd, toRemove } = calculateArrayDiff(oldIds, newIds)

  const promises: Promise<void>[] = [
    ...toAdd.map((globalId, index) =>
      addToComponent({
        composerId: toGlobalEntityId(String(state.entityId)),
        componentId: toGlobalEntityId(globalId),
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
    ...toRemove.map((globalId) =>
      removeFromComponent({
        composerId: toGlobalEntityId(String(state.entityId)),
        componentId: toGlobalEntityId(globalId),
      })
    ),
  ]

  await Promise.all(promises)
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
  const { toAdd, toRemove } = calculateArrayDiff(oldValues, newValues)

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

  await invalidateEntityQueries(queryClient, {
    entityKey: state.entityKey,
    relationshipKey,
    refetchGlobalData: true,
  })
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

  await invalidateEntityQueries(queryClient, { entityKey: state.entityKey })
}
