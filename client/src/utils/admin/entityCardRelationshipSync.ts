import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS, type GlobalRelationshipKey } from '@/constants/relationships'
import type { ValidAdminValue } from '@/constants/primitives'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'
import {
  applyRelationshipIdDiff,
  dedupeIdsPreserveOrder,
  relationshipIdsFromFieldValue,
} from '@/utils/fieldContext/fieldContextSaveHelpers'
import { getRelationshipFrontendKeysForParent, getRelationshipKeysForParent } from '@/utils/admin/relationshipKeysForParent'

/**
 * Remove relationship join-array keys so PUT/create only sends real model columns.
 */
export function stripRelationshipKeysFromPayload(
  entityKey: GlobalEntityKey,
  payload: Record<string, ValidAdminValue>
): Record<string, ValidAdminValue> {
  const out = { ...payload }
  for (const fk of getRelationshipFrontendKeysForParent(entityKey)) {
    delete out[fk]
  }
  return out
}

/**
 * After entity row exists, persist multiselect relationship fields via POST/DELETE; batch-refetch once.
 */
export async function syncEntityCardRelationshipSelections(params: {
  entityKey: GlobalEntityKey
  isNew: boolean
  parentId: string
  entityVal: Record<string, ValidAdminValue>
  entityToSave: Record<string, ValidAdminValue>
  queryClient: QueryClient
}): Promise<void> {
  const { entityKey, isNew, parentId, entityVal, entityToSave, queryClient } = params
  const relationshipKeys = getRelationshipKeysForParent(entityKey)
  const touchedRelationshipKeys: GlobalRelationshipKey[] = []

  for (const relationshipKey of relationshipKeys) {
    const fk = RELATIONSHIP_KEYS[relationshipKey].frontendKey
    const oldIds = isNew ? [] : relationshipIdsFromFieldValue(entityVal[fk])
    const newIds = relationshipIdsFromFieldValue(entityToSave[fk])
    const normalizedNew = dedupeIdsPreserveOrder(newIds)
    const { toAdd, toRemove } = calculateArrayDiff(oldIds, normalizedNew)
    if (toAdd.length === 0 && toRemove.length === 0) {
      continue
    }
    await applyRelationshipIdDiff({
      relationshipKey,
      parentId,
      oldIds,
      newIds,
    })
    touchedRelationshipKeys.push(relationshipKey)
  }

  if (touchedRelationshipKeys.length === 0) {
    return
  }

  await queryClient.refetchQueries({ queryKey: ['globalData'] })
  queryClient.invalidateQueries({ queryKey: [entityKey] })
  for (const rk of touchedRelationshipKeys) {
    queryClient.invalidateQueries({ queryKey: [rk] })
  }
  if (entityKey === 'blockShape' || entityKey === 'blockInstance') {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
}
