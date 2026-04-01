/**
 * Entity list navigation and delete helpers.
 */
import type { Router } from 'vue-router'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('entityList')

interface EntityListOptions {
  entityKey: GlobalEntityKey
  router: Router
  remove: (id: GlobalEntityId) => Promise<void>
  notifyError: (message: string) => void
  routes?: {
    create?: string
    edit?: string
  }
  deleteConfirmation?: string | ((entityId: GlobalEntityId) => string)
  deleteErrorMessage?: string | ((error: unknown) => string)
  /** When set, skips confirm + `remove`; caller runs contract delete flow (e.g. wizard). */
  contractDelete?: (id: GlobalEntityId) => void | Promise<void>
}

export interface EntityListReturn {
  goToCreate: () => void
  goToEdit: (id: GlobalEntityId) => void
  handleDelete: (id: GlobalEntityId) => Promise<void>
}

export function entityList(options: EntityListOptions): EntityListReturn {
  const {
    entityKey,
    router,
    remove,
    notifyError,
    routes = {},
    deleteConfirmation = 'Are you sure you want to delete this item?',
    deleteErrorMessage = 'Failed to delete item',
    contractDelete,
  } = options

  const createRouteName = routes.create || `${entityKey}-create`
  const editRouteName = routes.edit || `${entityKey}-edit`

  const goToCreate = (): void => {
    router.push({ name: createRouteName })
  }

  const goToEdit = (id: GlobalEntityId): void => {
    router.push({ name: editRouteName, params: { id: String(id) } })
  }

  const getDeleteConfirmation = (entityId: GlobalEntityId): string => {
    if (typeof deleteConfirmation === 'function') {
      return deleteConfirmation(entityId)
    }
    return deleteConfirmation
  }

  const getDeleteErrorMessage = (error: unknown): string => {
    if (typeof deleteErrorMessage === 'function') {
      return deleteErrorMessage(error)
    }
    return deleteErrorMessage
  }

  const handleDelete = async (id: GlobalEntityId): Promise<void> => {
    if (contractDelete != null) {
      try {
        await contractDelete(id)
      } catch (err) {
        logger.error('Delete entity failed', { err })
        const errorMsg = getDeleteErrorMessage(err)
        notifyError(errorMsg)
        throw err
      }
      return
    }

    const confirmation = getDeleteConfirmation(id)

    if (!confirm(confirmation)) {
      return
    }

    try {
      await remove(id)
    } catch (err) {
      logger.error('Delete entity failed', { err })
      const errorMsg = getDeleteErrorMessage(err)
      notifyError(errorMsg)
      throw err
    }
  }

  return {
    goToCreate,
    goToEdit,
    handleDelete
  }
}
