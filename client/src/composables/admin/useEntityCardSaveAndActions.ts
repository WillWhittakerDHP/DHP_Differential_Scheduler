/**
 * PATTERN: EntityCard actions + save state + save handlers in one composable.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { computed, type Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { useEntityCardSaveHandlers } from '@/composables/admin/useEntityCardSaveHandlers'
import type { UseEntityCardSaveStateReturn } from '@/composables/admin/useEntityCardSaveState'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardSaveAndActionsParams {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  isNew: boolean
  form: Ref<FormContext | undefined>
  admin: { getEntity: (key: GlobalEntityKey, id: string) => Record<string, unknown> | undefined }
  emit: {
    (e: 'delete', id: string): void
    (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
    (e: 'cancelled'): void
  }
  logger: AppLogger
}

export interface UseEntityCardSaveAndActionsReturn {
  handleSave: () => Promise<void>
  handleUndo: () => void
  showDeleteDialog: Ref<boolean>
  handleDeleteClick: () => void
  handleDelete: () => Promise<void>
  handleCancelDelete: () => void
  handleCancel: () => void
  unifiedSaveState: UseEntityCardSaveStateReturn
}

export function useEntityCardSaveAndActions(
  params: UseEntityCardSaveAndActionsParams
): UseEntityCardSaveAndActionsReturn {
  const { entityKey, entity, isNew, form, admin, emit, logger } = params

  const formInstance = form.value
  if (!formInstance) {
    throw new Error('useEntityCardSaveAndActions requires form to be set')
  }

  const entityCardActions = useEntityCardActions({
    entityKey,
    entity: computed(() => entity),
    form,
    isNew,
    onDelete: (id: string) => emit('delete', id),
    onSaved: (entity: GlobalEntity<GlobalEntityKey>) => emit('saved', entity),
    onCancelled: () => emit('cancelled'),
  })

  const {
    showDeleteDialog,
    handleSave: _handleSave,
    handleUndo: _handleUndo,
    handleDeleteClick,
    handleDelete,
    handleCancelDelete,
    handleCancel,
  } = entityCardActions

  const unifiedSaveState = useEntityCardSaveState({
    form: formInstance,
    entityKey,
    entityId: entity.id,
    getEntityValues: () => {
      const savedEntity = isNew
        ? entity
        : (admin.getEntity(entityKey, entity.id) || entity)
      return savedEntity as Record<string, unknown>
    },
  })

  const saveHandlers = useEntityCardSaveHandlers({
    form: formInstance,
    admin,
    entityKey,
    entityId: entity.id,
    isNew,
    logger,
    _handleSave,
    _handleUndo,
    unifiedSaveState,
  })

  return {
    handleSave: saveHandlers.handleSave,
    handleUndo: saveHandlers.handleUndo,
    showDeleteDialog,
    handleDeleteClick,
    handleDelete,
    handleCancelDelete,
    handleCancel,
    unifiedSaveState,
  }
}
