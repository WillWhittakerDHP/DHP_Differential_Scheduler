/**
 * Save/delete flows for entity cards — extracted from useEntityCardActions.
 * WHY: Keeps composable function body under complexity thresholds.
 */

import type { QueryClient } from '@tanstack/vue-query'
import type { FormContext } from 'vee-validate'
import type { Ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { mergeEntityValuesForCardSave } from '@/utils/admin/entityCardSaveMerge'
import {
  stripRelationshipKeysFromPayload,
  syncEntityCardRelationshipSelections,
} from '@/utils/admin/entityCardRelationshipSync'

const logger = createLogger('entityCardActionsPersistence')

export interface EntityCardSaveDeps<GE extends GlobalEntityKey> {
  entityKey: GE
  isNew: boolean
  validateForm: () => Promise<boolean>
  showError: (message: string) => void
  success: (message: string) => void
  formInstance: FormContext
  entity: Ref<GlobalEntity<GE>>
  createEntity: (payload: Partial<GlobalEntity<GE>>) => Promise<GlobalEntity<GE>>
  updateEntity: (payload: Partial<GlobalEntity<GE>>, id: GlobalEntityId) => Promise<unknown>
  getEntityCreateMessage: (key: GE) => string
  getEntitySuccessMessage: (key: GE) => string
  onSaved?: (entity: GlobalEntity<GE>) => void
  queryClient: QueryClient
}

export async function executeEntityCardSave<GE extends GlobalEntityKey>(
  deps: EntityCardSaveDeps<GE>
): Promise<void> {
  const {
    entityKey,
    isNew,
    validateForm,
    showError,
    success,
    formInstance,
    entity,
    createEntity,
    updateEntity,
    getEntityCreateMessage,
    getEntitySuccessMessage,
    onSaved,
    queryClient,
  } = deps

  try {
    const isValid = await validateForm()
    if (!isValid) {
      showError('Please fix form errors before saving')
      return
    }

    const formValues = formInstance.values as Record<string, ValidAdminValue>
    const entityVal = entity.value as Record<string, ValidAdminValue>
    const entityToSave = mergeEntityValuesForCardSave(
      entityKey,
      entityVal,
      formValues,
      formInstance.values.contentRows
    ) as Partial<GlobalEntity<GE>>

    const scalarPayload = stripRelationshipKeysFromPayload(
      entityKey,
      entityToSave as Record<string, ValidAdminValue>
    ) as Partial<GlobalEntity<GE>>

    if (isNew) {
      const createdEntity = await createEntity(scalarPayload)
      const parentId = String((createdEntity as { id: string }).id)
      await syncEntityCardRelationshipSelections({
        entityKey,
        isNew: true,
        parentId,
        entityVal,
        entityToSave: entityToSave as Record<string, ValidAdminValue>,
        queryClient,
      })
      success(getEntityCreateMessage(entityKey))
      onSaved?.(createdEntity as GlobalEntity<GE>)
      return
    }

    const existingId = toGlobalEntityId((entityVal as { id: string }).id)
    await updateEntity(scalarPayload, existingId)
    await syncEntityCardRelationshipSelections({
      entityKey,
      isNew: false,
      parentId: String(existingId),
      entityVal,
      entityToSave: entityToSave as Record<string, ValidAdminValue>,
      queryClient,
    })
    success(getEntitySuccessMessage(entityKey))
    onSaved?.(entity.value as GlobalEntity<GE>)
  } catch (err) {
    logger.error('Entity save failed', { err, entityKey })
    const errorMessage = getApiErrorMessage(err, `Failed to save ${entityKey}. Please try again.`)
    showError(errorMessage)
  }
}

export interface EntityCardDeleteDeps<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: Ref<GlobalEntity<GE>>
  showError: (message: string) => void
  success: (message: string) => void
  remove: (id: GlobalEntityId) => Promise<unknown>
  getEntityDeleteTitle: (key: GE) => string
  onDelete?: (id: GlobalEntityId) => void
  closeDialog: () => void
}

export async function executeEntityCardDelete<GE extends GlobalEntityKey>(
  deps: EntityCardDeleteDeps<GE>
): Promise<void> {
  const { entityKey, entity, showError, success, remove, getEntityDeleteTitle, onDelete, closeDialog } = deps

  try {
    const entityVal = entity.value as { id: string }
    const entityId = toGlobalEntityId(entityVal.id)
    await remove(entityId)
    closeDialog()
    success(`${getEntityDeleteTitle(entityKey)} deleted successfully`)
    onDelete?.(entityId)
  } catch (err) {
    logger.error('Entity delete failed', { err, entityKey })
    const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityKey}`
    showError(errorMessage)
  }
}
